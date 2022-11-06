const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const boardWidth = canvas.width;
const boardHeight = canvas.height;

var rowNumber = 16;
var colNumber = 16;
var datas = [];
var hard = 8;

var m_LineStyleWidth = 0.3;
var m_CircleStyleWidth = 0.05;
var m_BlockCellWidth = 0.7;
//记录主路线的位置
var m_PathArr = [];
var m_NoPathArr = [];
//////////////////////
//程序入口
////////////////////
function Start() {

}

function Reset() {
    //清除数据
    datas = [];
    m_PathArr = [];
    m_NoPathArr = [];
}
//画
function CreateA4(category) {
    //二维码
    let loadImg0 = function () {
        DrawImage('./qr.png', () => {
            toastDlg.Close();
            ShowImageDlg();
        }, [50, 50, 180, 180]);
    }

    var toastDlg = new Toast({
        text: "生成中"
    });
    toastDlg.Show();
    //ctx.clearRect(0,0,boardWidth,boardHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    WriteText("迷宫A4", 12.0, 2.0, 1.4);

    if (category == 1) {
        rowNumber = 8;
        colNumber = 8;
        m_BlockCellWidth = 1.4;
        CreateOneMaze(1.5, 6);
        CreateOneMaze(16.5, 6);
    }else if (category == 2) {
        rowNumber = 16;
        colNumber = 16;
        m_BlockCellWidth = 0.7;
        CreateOneMaze(1.5, 6);
        CreateOneMaze(16.5, 6);
    }else if (category == 3) {
        rowNumber = 24;
        colNumber = 24;
        m_BlockCellWidth = 0.5;
        CreateOneMaze(1.5, 6);
        CreateOneMaze(16.5, 6);
    }else if (category == 4) {
        rowNumber = 32;
        colNumber = 32;
        m_BlockCellWidth = 0.4;
        CreateOneMaze(1.2, 6);
        CreateOneMaze(15.8, 6);
    }else if (category == 5) {
        rowNumber = 40;
        colNumber = 40;
        m_BlockCellWidth = 0.4;
        CreateOneMaze(7.5, 4);
        //CreateOneMaze(15.8, 6);
    }

    //贴图
    loadImg0();
}

function CreateOneMaze(x, y) {
    //1.时间
    WriteText("用时______", x, y-0.5, 0.5);
    Reset();
    //生成数据
    CreateBlockDatas();
    //创建路径
    CreateMainPath();
    //创建分叉
    CreateBranchPath(m_PathArr);
    //绘制
    DrawBlocks(x, y);
}

//创建数据
function CreateBlockDatas() {
    for (let i = 0; i < rowNumber; i++) {
        for (let j = 0; j < colNumber; j++) {
            let cell1 = new BlockCellObject();
            datas.push(cell1);
        }
    }
}

//迷宫单元格
function BlockCellObject() {
    this.L = 1;   //左
    this.R = 1;   //右
    this.T = 1;   //上
    this.B = 1;   //下

    this.DoorState = function (dir2) {
        if (dir2 == 1) {
            //往上
            return this.T;
        } else if (dir2 == 2) {
            //往右
            return this.R;
        } else if (dir2 == 3) {
            //往下
            return this.B;
        } else if (dir2 == 4) {
            //往左
            return this.L;
        }

        return 0;
    }
    //开门
    this.OpenDoor = function (dir2) {
        if (dir2 == 1) {
            //往上
            this.T = 0;
            return true;
        } else if (dir2 == 2) {
            //往右
            this.R = 0;
            return true;
        } else if (dir2 == 3) {
            //往下
            this.B = 0;
            return true;
        } else if (dir2 == 4) {
            //往左
            this.L = 0;
            return true;
        }

        return false;
    }

    //关门
    this.CloseDoor = function (dir2) {
        if (dir2 == 1) {
            //往上
            this.T = 1;
            return true;
        } else if (dir2 == 2) {
            //往右
            this.R = 1;
            return true;
        } else if (dir2 == 3) {
            //往下
            this.B = 1;
            return true;
        } else if (dir2 == 4) {
            //往左
            this.L = 1;
            return true;
        }

        return false;
    }
}

//绘制迷宫
function DrawBlocks(x0, y0) {
    let x1 = x0;
    let y1 = y0;
    for (let i = 0; i < rowNumber; i++) {
        for (let j = 0; j < colNumber; j++) {
            let cell1 = datas[GetPosition(j, i)];
            DrawOneBlock(x1, y1, cell1);
            x1 = x1 + m_BlockCellWidth;
        }
        y1 = y1 + m_BlockCellWidth;
        x1 = x0;
    }
}

//绘制单元格
function DrawOneBlock(x0, y0, cell1) {
    if (cell1.T != 0) DrawLine(x0, y0, x0 + m_BlockCellWidth, y0);
    if (cell1.R != 0) DrawLine(x0 + m_BlockCellWidth, y0, x0 + m_BlockCellWidth, y0 + m_BlockCellWidth);
    if (cell1.B != 0) DrawLine(x0 + m_BlockCellWidth, y0 + m_BlockCellWidth, x0, y0 + m_BlockCellWidth);
    if (cell1.L != 0) DrawLine(x0, y0 + m_BlockCellWidth, x0, y0);
}

//生成路径
function CreateMainPath() {
    let startC = 0;
    let startR = rowNumber - 1;
    let startPos = GetPosition(startC, startR);
    let endC = colNumber - 1;
    let endR = 0;
    let endPos = GetPosition(endC, endR);
    //1.开始格子开门
    datas[startPos].OpenDoor(4);
    datas[endPos].OpenDoor(2);

    m_PathArr.push(startPos);
    //2.生成主路线
    let nowPos = startPos;
    for (let i = 0; i < 5000; i++) {
        let pos2 = GoNextBlockCell(nowPos);
        if (pos2 == -1) {
            //无效的路 需要往后退一步
            if (m_PathArr.length >= 2) {
                if (GoBack(m_PathArr[m_PathArr.length - 1], m_PathArr[m_PathArr.length - 2])) {
                    nowPos = m_PathArr[m_PathArr.length - 2];
                    m_NoPathArr.push(m_PathArr[m_PathArr.length - 1]);
                    m_PathArr.length = m_PathArr.length - 1;
                }
            }
            continue;
        }
        if (pos2 == endPos) break; //结束
        //记录避免走回头路
        m_PathArr.push(pos2);
        nowPos = pos2;
    }
    m_PathArr.push(endPos);
    //3.生成分叉路线
    m_NoPathArr = [];

}

//生成分叉
function CreateBranchPath(pathMain) {
    let randPosPathArr = GetRandQueue(pathMain);
    // console.log(randPosPathArr);
    let pathSubArr = [];
    for (let j = 0; j < randPosPathArr.length; j++) {
        let posAlong = randPosPathArr[j];

        while (true) {
            let pos2 = GoNextBlockCell(posAlong);
            if (pos2 == -1) {
                break;
            }
            m_PathArr.push(pos2);
            //m_NoPathArr.push(pos2);
            posAlong = pos2;
            pathSubArr.push(posAlong);
        }

        //迭代处理分叉路径
        //可能存在没有消除的空格
        if (pathSubArr.length > 0) {
            CreateBranchPath(pathSubArr);
        }
    }
}
//回退
function GoBack(pos0, pos2) {
    let arr0 = GetColumnRow(pos0);
    let arr2 = GetColumnRow(pos2);

    if ((arr2[1] - arr0[1]) == -1) {
        datas[pos0].CloseDoor(1);
        datas[pos2].CloseDoor(3);
        return true;
    } else if ((arr2[1] - arr0[1]) == 1) {
        datas[pos0].CloseDoor(3);
        datas[pos2].CloseDoor(1);
        return true;
    }

    if ((arr2[0] - arr0[0]) == 1) {
        datas[pos0].CloseDoor(2);
        datas[pos2].CloseDoor(4);
        return true;
    } else if ((arr2[0] - arr0[0]) == -1) {
        datas[pos0].CloseDoor(4);
        datas[pos2].CloseDoor(2);
        return true;
    }

    return false;
}

//走到下一个方格
function GoNextBlockCell(pos0) {
    let arr0 = GetColumnRow(pos0);
    let c0 = arr0[0];
    let r0 = arr0[1];
    let cell0 = datas[pos0];
    let c2;
    let r2;
    let dir22;
    //如果四个方向都判断了，直接返回
    let dir2Arr = GetRandQueueInRange(4, 1, 4);
    for (let i = 0; i < dir2Arr.length; i++) {
        let dir2 = dir2Arr[i];
        //判断是否已经在开门的格子方向
        if (cell0.DoorState(dir2) == 0) continue;

        if (dir2 == 1) {
            //往上
            r2 = r0 - 1;
            c2 = c0;
            dir22 = 3;
        } else if (dir2 == 2) {
            //往右
            r2 = r0;
            c2 = c0 + 1;
            dir22 = 4;
        } else if (dir2 == 3) {
            //往下
            r2 = r0 + 1;
            c2 = c0;
            dir22 = 1;
        } else if (dir2 == 4) {
            //往左
            r2 = r0;
            c2 = c0 - 1;
            dir22 = 2;
        }

        let pos2 = GetPosition(c2, r2);
        //判断是否越界
        if (c2 < 0 || c2 >= colNumber) continue;
        if (r2 < 0 || r2 >= rowNumber) continue;

        //不走回头路
        if (m_PathArr.indexOf(pos2) >= 0) continue;
        //无效的路径不重复
        if (m_NoPathArr.indexOf(pos2) >= 0) continue;

        let cell2 = datas[pos2];
        //判断下个格式是否开门
        if (cell2.DoorState(dir22) == 0) continue;

        cell0.OpenDoor(dir2);
        cell2.OpenDoor(dir22);

        return pos2;
    }

    return -1;
}

//计算随机位置
function RandomPositions() {
    //计算 行 与 列
    let pos1 = RandomInt(0, rowNumber * colNumber - 1);
    let colandrow = GetColumnRow(pos1);
    let colandrow2 = RandomPositionNext(pos1);
    return colandrow.concat(colandrow2);
}

//计算随机位置的下一个位置
function RandomPositionNext(pos1) {
    let colandrow = GetColumnRow(pos1);
    //随机方向
    let dir2 = RandomInt(0, 7);
    if (m_randomDir2 == 1) {
        //上部
        dir2 = RandomInt(0, 4);
    } else if (m_randomDir2 == 2) {
        //上部
        dir2 = RandomInt(3, 7);
    } else if (m_randomDir2 == 0) {
        if (dir2 >= 0 && dir2 <= 2) {
            m_randomDir2 = 1;
        } else if (dir2 >= 5 && dir2 <= 7) {
            m_randomDir2 = 2;
        }
    }
    let colandrow2 = [0, 0];
    if (dir2 == 0) {
        //左上
        colandrow2[0] = colandrow[0] - 1;
        colandrow2[1] = colandrow[1] - 1;
    } else if (dir2 == 1) {
        //中上
        colandrow2[0] = colandrow[0];
        colandrow2[1] = colandrow[1] - 1;
    } else if (dir2 == 2) {
        //右上
        colandrow2[0] = colandrow[0] + 1;
        colandrow2[1] = colandrow[1] - 1;
    } else if (dir2 == 3) {
        //左
        colandrow2[0] = colandrow[0] - 1;
        colandrow2[1] = colandrow[1];
    } else if (dir2 == 4) {
        //右
        colandrow2[0] = colandrow[0] + 1;
        colandrow2[1] = colandrow[1];
    } else if (dir2 == 5) {
        //左下
        colandrow2[0] = colandrow[0] - 1;
        colandrow2[1] = colandrow[1] + 1;
    } else if (dir2 == 6) {
        //中下
        colandrow2[0] = colandrow[0];
        colandrow2[1] = colandrow[1] + 1;
    } else if (dir2 == 7) {
        //右下
        colandrow2[0] = colandrow[0] + 1;
        colandrow2[1] = colandrow[1] + 1;
    }

    if (colandrow2[0] < 0) {
        colandrow2[0] = 0;
    } else if (colandrow2[0] >= colNumber) {
        colandrow2[0] = colNumber - 1;
    }

    if (colandrow2[1] < 0) {
        colandrow2[1] = 0;
    } else if (colandrow2[1] >= rowNumber) {
        colandrow2[1] = rowNumber - 1;
    }

    return colandrow2;
}

//column and  row 
function GetColumnRow(pos1) {
    let res = [];

    res[0] = pos1 % colNumber;
    res[1] = parseInt(pos1 / colNumber);

    return res;
}

//计算位置
function GetPosition(c, r) {
    return colNumber * r + c;
}

//绘制题目
function WriteText(str1, x, y, hei, scale) {
    scale = scale || 60;
    hei = hei * scale;
    let fontHei = hei + "px";
    ctx.font = "normal " + fontHei + " Arial";
    ctx.fillStyle = "#000000";
    let lines = str1.split('\n');
    for (let j = 0; j < lines.length; j++) {
        ctx.fillText(lines[j], x * scale, y * scale + (j * hei));
    }

}

function DrawLine(x1, y1, x2, y2, wid, scale, strColor) {
    scale = scale || 60;
    wid = wid || 0.1;
    ctx.lineWidth = wid * scale;
    ctx.strokeStyle = strColor || "black";
    //开始一个新的绘制路径
    ctx.beginPath();
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.lineTo(x2 * scale, y2 * scale);
    ctx.lineCap = "square"
    ctx.stroke();
    //关闭当前的绘制路径
    ctx.closePath();
}

function DrawCircle(cx, cy, radius, wid, scale, strColor) {
    scale = scale || 60;
    wid = wid || 0.1;
    ctx.beginPath();
    ctx.arc(cx * scale, cy * scale, radius * scale, 0, 2 * Math.PI, false);
    //ctx.fillStyle = '#9fd9ef';
    //ctx.fill();
    ctx.lineWidth = wid * scale;
    ctx.strokeStyle = strColor || "black";
    ctx.stroke();
    //关闭当前的绘制路径
    ctx.closePath();
}

//在范围内，生成一定数量不重复的随机数
function GetRandQueueInRange(n, min, max) {
    let arr = [];
    // 在此处补全代码
    for (let i = 0; i < n; i++) {
        let number = RandomInt(min, max);
        if (arr.indexOf(number) == -1) { //去除重复项
            arr.push(number);
        } else {
            i--;
        }
    }
    return arr;
    //return Array.from({length:n}, v=> RandomInt(min, max));

}

//生成随机队列
function GetRandQueue(array) {
    if (!array) {
        array = new Array();
        for (let i = 0; i < size; i++) {
            array[i] = i;
        }
    } else {
        array = array.concat();
    }
    let res = [], random;
    while (array.length > 0) {
        random = Math.floor(Math.random() * array.length);
        res.push(array[random]);
        array.splice(random, 1);
    }
    return res;
}

//生成随机值
function RandomInt(min, max) {
    var span = max - min + 1;
    var result = Math.floor(Math.random() * span + min);
    return result;
}

//显示生成的题目图片，长按保存
function ShowImageDlg() {
    let strImg = "<img ";
    strImg += "src=" + canvas.toDataURL('png', 1.0);
    strImg += " style='width:350px;height:280px;'></img>";
    let dlg1 = new Dialog({
        title: "长按图片，保存下载",
        text: strImg
    });

    dlg1.Show();
}

//下载
function DownLoad() {
    //确定图片的类型  获取到的图片格式 data:image/Png;base64,......
    let type = 'jpeg';
    let imgdata = canvas.toDataURL(type, 1.0);
    //将mime-type改为image/octet-stream,强制让浏览器下载
    let fixtype = function (type) {
        type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
        let r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    };
    imgdata = imgdata.replace(fixtype(type), 'image/octet-stream');
    //将图片保存到本地
    let savaFile = function (data, filename) {
        let save_link = document.createElement('a');
        save_link.href = data;
        save_link.download = filename;
        let event = new MouseEvent('click');
        save_link.dispatchEvent(event);
    };

    let filename = '' + new Date().format('yyyy-MM-dd_hhmmss') + '.' + type;
    //用当前秒解决重名问题
    savaFile(imgdata, filename);
}

Date.prototype.format = function (format) {
    let o = {
        "y": "" + this.getFullYear(),
        "M": "" + (this.getMonth() + 1),  //month
        "d": "" + this.getDate(),         //day
        "h": "" + this.getHours(),        //hour
        "m": "" + this.getMinutes(),      //minute
        "s": "" + this.getSeconds(),      //second
        "S": "" + this.getMilliseconds(), //millisecond
    }
    return Object.keys(o).reduce((pre, k) => (new RegExp("(" + k + "+)").test(pre)) ? (pre.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : o[k].padStart(2, "0"))) : pre, format);
}

//绘制图片
function DrawImage(img0, cb, params) {
    let imgObj = new Image();
    imgObj.src = img0;
    imgObj.onload = function () {
        ctx.drawImage(imgObj, params[0], params[1], params[2], params[3]);
        if (typeof cb == "function") {
            cb();
        }
    }
}