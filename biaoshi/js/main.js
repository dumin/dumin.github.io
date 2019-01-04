var Application = function (gv) {
    this.gv = gv;
    gv.getSelectWidth = function () { return 0; };
    gv.handleScroll = function () { };
    gv.handlePinch = function () { };
    gv.setPannable(false);
    gv.setRectSelectable(false);
    gv.setScrollBarVisible(false);
    gv.setMovableFunc(function () { return false; });

    this.iconNum = 26;

    this.registImage();

    gv.addInteractorListener(this.onInteract, this);

    this.status = 'stop';
};

Application.prototype = {};
Application.prototype.constructor = Application;

Application.prototype.registImage = function () {
    var setImage = ht.Default.setImage;
    var list = this.signList = [];
    var name;
    for (var i = 1; i <= this.iconNum; i++) {
        name = 'sign' + i;
        setImage(name, 'asset/sign/' + i + '.jpg');
        list.push(name);
    }

    setImage('start', 'asset/icon/start.json');
    setImage('end', 'asset/icon/end.json');


    this.signNode = this.gv.dm().getDataByTag('sign');
    this.signNode.s('shape', null);
    this.panelNode = this.gv.dm().getDataByTag('panel');
    this.panelNode.s('shape', null);
};

Application.prototype.start = function () {
    this.status = 'waiting';

    this.panelNode.s('2d.visible', true);
    this.panelNode.setImage('start');
    this.panelNode.a('timer', '');

    this.signNode.s('2d.visible', false);
};

Application.prototype.gameStart = function () {
    this.status = 'gaming';

    this.panelNode.s('2d.visible', false);
    this.signNode.s('2d.visible', true);

    this.startTime = Date.now();

    var list = this.signList;
    var temp, i, j;
    for (i = this.iconNum - 1; i > 0; i--) {
        j = Math.floor((i + 1) * Math.random());
        temp = list[i];
        list[i] = list[j];
        list[j] = temp;
    }

    this.round = this.iconNum;

    this.signNode.setImage(list[this.round - 1]);
};

Application.prototype.nextRound = function () {
    this.round--;

    if (this.round) {
        this.signNode.setImage(this.signList[this.round - 1]);
    }
    else {
        // 结束
        this.gameEnd();
    }
};

Application.prototype.gameEnd = function () {
    this.status = 'endGame';

    this.panelNode.s('2d.visible', true);
    this.panelNode.setImage('end');
    this.signNode.s('2d.visible', false);

    var cost = Date.now() - this.startTime;
    cost = Math.round(cost / 100);

    this.panelNode.a('cost', '' + (cost / 10) + '秒');
};

Application.prototype.waitGame = function () {
    var self = this;
    this.status = 'preStart';
    var timeout = 3;
    var preStart = function () {
        var t = timeout--;
        self.panelNode.a('timer', t);
        if (t) {
            setTimeout(preStart, 1000);
        }
        else {
            self.gameStart();
        }
    }
    preStart();
}

Application.prototype.onInteract = function (e) {
    if (e.kind !== 'clickData')
        return;

    var self = this;

    if (this.status === 'waiting') {
        return this.waitGame();
    }

    if (this.status === 'gaming') {
        return this.nextRound();
    }

    if (this.status === 'endGame') {
        return this.start();
    }
}
