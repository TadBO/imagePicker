// todo 我需要一个ui和完整的需求才能封装的更好
/**
 * 框出图片上对应的位置，可对图片进行缩放移动操作
 */
class imagePciker {
    /**
     * 相关配置
     * @param {*} config  传递的参数
     * @param {*} el      绑定的元素
     */
    constructor(config) {
        try {
            if (!config.imgSrc || !Array.isArray(config.imgSrc)) {
                throw new Error('参数异常！');
            }
        } catch (error) {
            console.log(error);
            return false;
        }
        this.img = new Image();
        this.imgIsLoaded = false; //图片是否加载完成
        this.canvas = document.createElement('canvas');
        this.width = config.width || '800';
        this.height = config.height || '600';
        this.canvas.width = config.width || '800';
        this.canvas.height = config.height || '600';
        // this.canvas.style.border = '1px solid #eee';
        this.el = config.el || 'body';
        this.context = this.canvas.getContext('2d');
        this.imgX = config.imgX || 0; //图片在画布的位置，默认0
        this.imgY = config.imgY || 0; //图片在画布的位置，默认0
        this.imageX = config.imgX || 0; //图片在画布的位置，默认0
        this.imageY = config.imgY || 0; //图片在画布的位置，默认0
        this.imgScale = 1; //缩放比例，默认为1
        this.differX = 0; //图片x轴与鼠标x轴差距，移动时用
        this.differy = 0; //图片y轴与鼠标y轴差距，移动时用
        this.isMove = false; //移动时标志
        this.posX = 0; //线的位置，x轴
        this.posY = 0; //线的位置，y轴
        this.lineW = 0; //线的长度
        this.lineH = 0; //线的宽度
        this.imgSrc = config.imgSrc; //传入图片的地址
        this.line = config.line || []; //默认显示的框
        this.srcIndex = 0;
        this.loop = config.loop || true; //默认轮播
        this.showMoveBtn = config.showMoveBtn || false; //右侧图片选择。默认不显示
        this.showTopBar = config.showTopBar !== undefined ? config.showTopBar : true; //上侧导航栏，默认显示
        this.init();
    }

    init() {
        this.show();
        this.loadImg(this.imgSrc[0].src); //默认显示第一张图片
        this.event();
    }
    /**
     * 图片加载
     * @param {} src 
     */
    loadImg(src) {
        this.img.onload = () => {
            this.imgIsLoaded = true;
            this.drawImage();
        }
        this.img.src = src;
    }
    /**
     * 绘制图片
     */
    drawImage() {
        //图片缩小限制
        let newWidth = this.img.width * this.imgScale <= 10 ? 10 : this.img.width * this.imgScale,
            newHeight = this.img.height * this.imgScale <= 10 ? 10 : this.img.height * this.imgScale;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); //绘制前清空canvas
        this.context.drawImage(
            this.img, //规定要使用的图像、画布或视频。
            0, 0, //开始剪切的 x 坐标位置。
            this.img.width, this.img.height, //被剪切图像的高度。
            this.imgX, this.imgY, //在画布上放置图像的 x 、y坐标位置。
            newWidth, newHeight //要使用的图像的宽度、高度
        );
        this.setPosition();
        this.setLineColor();
        this.context.strokeRect(this.imgX + this.posX * this.imgScale, this.imgY + this.posY * this.imgScale, this.lineW * this.imgScale, this.lineH * this.imgScale);
    }
    /**
     * 监听事件
     */
    event() {
        /**
         * 图片移动
         * @param {*} evt 
         */
        this.canvas.onmousedown = (evt) => {
            evt.stopPropagation();
            this.canvas.style.cursor = 'move';
            this.differX = event.clientX - this.imgX - document.querySelector(this.el).offsetLeft;
            this.differY = event.clientY - this.imgY - document.querySelector(this.el).offsetTop;
            this.isMove = true;
        };
        this.canvas.onmousemove = (evt) => { //移动
            evt.stopPropagation();
            if (this.isMove) {
                if (this.differX > this.img.width * this.imgScale || this.differX < 0) {
                    return false;
                }
                if (this.differY > this.img.height * this.imgScale) {
                    return false;
                }
                this.imgX = evt.clientX - this.differX - document.querySelector(this.el).offsetLeft;
                this.imgY = evt.clientY - this.differY - document.querySelector(this.el).offsetTop;
                this.drawImage(); //重新绘制图片
            }
        };
        this.canvas.onmouseup = () => {
            this.canvas.style.cursor = 'default';
            this.isMove = false;
        };
        /**
         * 图片放大缩小
         */
        this.canvas.onmousewheel = this.canvas.onwheel = (event) => { //滚轮放大缩小
            let pos = this.windowToCanvas(event.clientX, event.clientY),
                wheel;
            wheel = event.wheelDelta ? event.wheelDelta : (event.deltalY * (-40)); //获取当前鼠标的滚动情况
            if (wheel > 0) { //放大
                this.imgScale *= 2;
                this.imgX = this.imgX * 2 - pos.x;
                this.imgY = this.imgY * 2 - pos.y;
            } else { //缩小
                this.imgScale /= 2;
                this.imgX = this.imgX * 0.5 + pos.x * 0.5;
                this.imgY = this.imgY * 0.5 + pos.y * 0.5;
            }
            this.drawImage(); //重新绘制图片
        };
    }

    /**
     * 坐标转换
     * @param {*} x 
     * @param {*} y 
     */
    windowToCanvas(x, y) {
        var box = this.canvas.getBoundingClientRect(); //这个方法返回一个矩形对象，包含四个属性：left、top、right和bottom。分别表示元素各边与页面上边和左边的距离
        return {
            x: x - box.left - (box.width - this.canvas.width) / 2,
            y: y - box.top - (box.height - this.canvas.height) / 2
        };
    }

    /**
     * 设置显示位置
     */
    setPosition() {
        for (let i = 0, len = this.line.length; i < len; i++) {
            if (this.img.src.indexOf(this.line[i].flag) !== -1) {
                this.posX = this.line[i].posX;
                this.posY = this.line[i].posY;
                this.lineW = this.line[i].lineW;
                this.lineH = this.line[i].lineH;
                return false;
            } else {
                this.posX = 0;
                this.posY = 0;
                this.lineW = 0;
                this.lineH = 0;
            }
        }
    }

    /**
     * 设置线框的颜色
     */
    setLineColor() {
        this.line.forEach(element => {
            if (this.img.src.indexOf(element.flag) !== -1) {
                switch (element.state) {
                    case 0:
                        this.context.strokeStyle = 'red';
                        break;
                    case 1:
                        this.context.strokeStyle = 'green';
                        break;
                    default:
                        this.context.strokeStyle = '#000';
                }
            }
        });
    }
    //显示
    show() {
        let div = document.createElement('div');
        div.style.width = this.width + 'px';
        div.style.height = this.height + 'px';
        div.style.border = '1px solid #eee';
        div.style.position = 'relative';
        if (this.showMoveBtn) {
            div.appendChild(this.moveBtn()); //左侧控制栏
        }
        if (this.showTopBar) {
            this.canvas.style.paddingTop = '30px';
            div.appendChild(this.topBar()); //上侧菜单栏
        }

        div.appendChild(this.canvas);
        document.querySelector(this.el).appendChild(div);
    }
    /**
     * 右侧导航
     */
    moveBtn() {
        let ul = document.createElement('ul');
        ul.style.position = 'absolute';
        ul.style.listStyle = 'none';
        ul.style.top = '50%';
        ul.style.transform = 'translateY(-50%)';
        ul.style.right = 0;
        let li_pre = document.createElement('li');
        li_pre.style.width = '52px';
        li_pre.style.height = '52px';
        li_pre.style.lineHeight = '52px';
        li_pre.style.textAlign = 'center';
        li_pre.innerText = '上一张';
        li_pre.style.backgroundColor = 'rgba(0,0,0,.4)';
        li_pre.style.color = '#fff';
        li_pre.style.cursor = 'pointer';
        let li_now = document.createElement('li');
        li_now.style.width = '52px';
        li_now.style.height = '52px';
        li_now.style.lineHeight = '52px';
        li_now.style.textAlign = 'center';
        li_now.style.backgroundColor = 'rgba(0,0,0,.4)';
        li_now.style.color = '#fff';
        li_now.style.borderBottom = '1px solid #ddd';
        li_now.style.borderTop = '1px solid #ddd';
        li_now.innerHTML = `${this.srcIndex + 1} / ${this.imgSrc.length}`;
        li_now.setAttribute('id', 'li_now');
        let li_next = document.createElement('li');
        li_next.style.width = '52px';
        li_next.style.height = '52px';
        li_next.style.lineHeight = '52px';
        li_next.style.textAlign = 'center';
        li_next.style.backgroundColor = 'rgba(0,0,0,.4)';
        li_next.style.color = '#fff';
        li_next.innerHTML = '下一张';
        li_next.style.cursor = 'pointer';
        ul.appendChild(li_pre);
        ul.appendChild(li_now);
        ul.appendChild(li_next);
        li_pre.addEventListener('click', () => { //切换图片，上一张
            this.srcIndex--;
            if (this.loop) {
                if (this.srcIndex < 0) {
                    this.srcIndex = this.imgSrc.length - 1;
                }
            } else {
                if (this.srcIndex < 0) {
                    return false;
                }
            }
            this.loadImg(this.imgSrc[this.srcIndex].src);
            li_now.innerHTML = `${this.srcIndex + 1} / ${this.imgSrc.length}`;
            if (this.showTopBar) {
                document.querySelector('#top-bar').childNodes.forEach((span, j) => {
                    span.style.background = 'transparent';
                    if (j === this.srcIndex) {
                        span.style.background = '#1e90ff';
                    }
                });
            }
            this.imgX = 0;
            this.imgY = 0;
            this.imgScale = 1;
            this.drawImage();
        });
        li_next.addEventListener('click', () => { //切换图片，上一张
            this.srcIndex++;
            if (this.loop) {
                if (this.srcIndex >= this.imgSrc.length) {
                    this.srcIndex = 0;
                }
            } else {
                if (this.srcIndex >= this.imgSrc.length) {
                    return false;
                }
            }
            this.loadImg(this.imgSrc[this.srcIndex].src);
            li_now.innerHTML = `${this.srcIndex + 1} / ${this.imgSrc.length}`;
            document.querySelector('#top-bar').childNodes.forEach((span, j) => {
                span.style.background = 'transparent';
                if (j === this.srcIndex) {
                    span.style.background = '#1e90ff';
                }
            });
            this.imgX = this.imageX;
            this.imgY = this.imageY;
            this.imgScale = 1;
            this.drawImage();
        });
        return ul;
    }
    /**
     * 头部导航
     */
    topBar() {
        let div = document.createElement('div');
        div.setAttribute('id', 'top-bar')
        div.style.position = 'absolute';
        div.style.height = '30px';
        div.style.lineHeight = '30px';
        div.style.width = '100%';
        div.style.color = '#fff';
        div.style.background = 'rgba(0, 0, 0 , .4)';
        div.style.top = 0;
        div.style.left = 0;
        this.imgSrc.forEach((element, index) => {
            let span = document.createElement('span');
            span.innerHTML = element.title;
            span.style.display = 'inline-block';
            span.style.padding = '0 10px';
            span.style.cursor = 'pointer';
            if (index === 0) { //默认第一张为选中的值
                span.style.background = '#1e90ff';
            }
            span.setAttribute('data-index', index);
            div.appendChild(span);
        });
        div.onclick = (evt) => {  //tab切换
            div.childNodes.forEach(ele => {
                ele.style.background = 'transparent';
            });
            if (evt.target.getAttribute('data-index')) {
                evt.target.style.background = '#1e90ff';
                this.srcIndex = Number(evt.target.getAttribute('data-index'));
                if (this.showMoveBtn) {
                    document.querySelector('#li_now').innerHTML = `${this.srcIndex + 1} / ${this.imgSrc.length}`;
                }
                this.loadImg(this.imgSrc[this.srcIndex].src);
                this.line.forEach(value => {
                    if (this.imgSrc[this.srcIndex].src.indexOf(value.flag) !== -1) {
                        this.imgX = -value.posX;
                        this.imgY = -value.posY;
                    }
                })
              
                this.imgScale = 1;
                this.drawImage();
            }
        }
        return div;
    }
    selected(data) {
        try {
            if (data.length > this.imgSrc.length) {
                throw new Error('参数异常！');
            }
        } catch (error) {
            console.log(error);
            return false;
        }
        //显示头部有框的页面
        if (this.showTopBar) {
            this.imgSrc.forEach((value, index) => {
                document.querySelector('#top-bar').childNodes[index].style.color = '#fff';
                data.forEach((val, i) => {
                    if (value.src.indexOf(val.flag) != -1) {
                        document.querySelector('#top-bar').childNodes[index].style.color = 'red';
                    }
                });
            });
        }
        //绘制第一个有框的图片
        for (let index = 0, len = this.imgSrc.length; index < len; index++) {
            //默认显示传入参数的第一个
            let value = this.imgSrc[index];
            if (value.src.indexOf(data[0].flag) !== -1) {
                this.loadImg(value.src);
                this.imgX = - data[0].posX;
                this.imgY = - data[0].posY;
                this.imgScale = 1;
                this.line = data;
                this.drawImage();
                this.srcIndex = index;
                if (this.showMoveBtn) {
                    document.querySelector('#li_now').innerHTML = `${this.srcIndex + 1} / ${this.imgSrc.length}`;
                }
                if (this.showTopBar) {
                    document.querySelector('#top-bar').childNodes.forEach((span, j) => {
                        span.style.background = 'transparent';
                        if (j === index) {
                            span.style.background = '#1e90ff';
                        }
                    });
                }
                return false; //找到该夜就跳出循环
            }
        }
    }
}