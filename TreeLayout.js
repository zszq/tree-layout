var TreeLayout = {
  //递归求左边界
  boundaryLeft: function (obj, array, depth) {
    if (Array.isArray(obj.children) && obj.children.length > 0) {
      var x = obj.children[0].x;
      if (typeof array[depth + 1] === "undefined") {
        array[depth + 1] = x;
      } else {
        if (x < array[depth + 1]) {
          array[depth + 1] = x;
        }
      }
      for (var i = 0; i < obj.children.length; i++) {
        this.boundaryLeft(obj.children[i], array, depth + 1);
      }
    }
  },

  //递归求右边界
  boundaryRight: function (obj, array, depth) {
    if (Array.isArray(obj.children) && obj.children.length > 0) {
      var x = obj.children[obj.children.length - 1].x;
      if (typeof array[depth + 1] === "undefined") {
        array[depth + 1] = x;
      } else {
        if (x > array[depth + 1]) {
          array[depth + 1] = x;
        }
      }
      for (var i = 0; i < obj.children.length; i++) {
        this.boundaryRight(obj.children[i], array, depth + 1);
      }
    }
  },

  //求左边界，返回新的数组。
  getBoundaryLeft: function (obj) {
    var left = [];
    left[0] = obj.x;
    this.boundaryLeft(obj, left, 0);
    return left;
  },

  //求右边界，在旧数组上修改。
  setBoundaryRight: function (obj, right) {
    right[0] = obj.x;
    this.boundaryRight(obj, right, 0);
  },

  //通过左右边界计算偏移量
  calcOffset: function (right, left) {
    var number = left.length < right.length ? left.length : right.length;
    // var depth = left.length > right.length ? left.length : right.length;
    var offset = right[0] - left[0];
    for (var i = 1; i < number; i++) {
      if (right[i] - left[i] > offset) {
        offset = right[i] - left[i];
      }
    }
    // return offset + 1 + (depth - 1) * 0.2;
    return offset + 1;
  },

  //平移所有节点
  translateAll: function (obj, offset) {
    obj.x += offset;
    if (Array.isArray(obj.children) && obj.children.length > 0) {
      for (var i = 0; i < obj.children.length; i++) {
        this.translateAll(obj.children[i], offset);
      }
    }
  },

  //计算所有节点横向虚拟位置，稍后根据画布尺寸以及横竖要求计算所有节点真实位置。
  virtualLayout: function (obj) {
    if (Array.isArray(obj.children) && obj.children.length > 0) {
      var right = []; //右边界
      for (var i = 0; i < obj.children.length; i++) {
        this.virtualLayout(obj.children[i]);
        if (i > 0) {
          this.setBoundaryRight(obj.children[i - 1], right); //把前面所有子树当做整体，更新这个整体的右边界。
          var left = this.getBoundaryLeft(obj.children[i]); //取这个子树的左边界
          var offset = this.calcOffset(right, left); //左右边界比较，求这个子树的偏移量
          this.translateAll(obj.children[i], offset); //整体移动这个子树
        }
      }
      obj.x = (obj.children[0].x + obj.children[obj.children.length - 1].x) / 2; //父节点在第一个子节点和最后一个子节点的中间。
    } else {
      obj.x = 0;
    }
  },

  //计算总深度和总宽度 this.reallyLayout(obj, 0, origin, width / size[0], height / size[1], true); 固定宽高时按比例计算
  getTreeBounding: function (obj) {
    var right = [];
    this.setBoundaryRight(obj, right);
    var maxW = right[0];
    for (var i = 1; i < right.length; i++) {
      if (maxW < right[i]) {
        maxW = right[i];
      }
    }
    return [maxW, right.length - 1];
  },

  //根据画布位置和尺寸以及横竖布局来确定所有节点的最终位置
  reallyLayout: function (obj, depth, origin, width, height, gapX, gapY, horizontal) {
    if (horizontal) {
      // 必须先设置y在设置x
      obj.y = Math.round(obj.x * (height + gapX) + origin.y);
      obj.x = Math.round(depth * (width + gapY) + origin.x);
    } else {
      obj.y = Math.round(depth * (height + gapX) + origin.y);
      obj.x = Math.round(obj.x * (width + gapY) + origin.x);
    }
    if (Array.isArray(obj.children) && obj.children.length > 0) {
      for (var i = 0; i < obj.children.length; i++) {
        this.reallyLayout(obj.children[i], depth + 1, origin, width, height, gapX, gapY, horizontal);
      }
    }
  },

  //横向布局
  horizontal: function (obj, origin, width=10, height=10, gapX=10, gapY=10) {
    this.virtualLayout(obj); //计算所有节点横向虚拟位置
    this.reallyLayout(obj, 0, origin, width, height, gapX, gapY, true); //根据画布位置和尺寸以及横竖布局来确定所有节点的最终位置
    // console.log(obj);
  },

  //竖向布局
  vertical: function (obj, origin, width=10, height=10, gapX=10, gapY=10) {
    this.virtualLayout(obj); //计算所有节点横向虚拟位置
    this.reallyLayout(obj, 0, origin, width, height, gapX, gapY, false); //根据画布位置和尺寸以及横竖布局来确定所有节点的最终位置
    // console.log(obj);
  },
};
