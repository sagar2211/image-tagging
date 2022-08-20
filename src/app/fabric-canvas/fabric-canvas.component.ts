import { Component, OnInit, AfterViewInit } from '@angular/core';
import 'fabric';
declare const fabric: any;
@Component({
  selector: 'app-fabric-canvas',
  templateUrl: './fabric-canvas.component.html',
  styleUrls: ['./fabric-canvas.component.css']
})
export class FabricCanvasComponent implements OnInit, AfterViewInit {
  //POLYGON DATAS
  myCanvas: any;
  image = new Image();
  url: string;
  isCanvasDrawn: boolean = true;
  canvas: any;
  polygon: any;
  isImageDrawn: boolean = false;
  isPolygonDrawn: boolean = false;
  points = [];
  newPt: any;
  polygonArray = [];
  polyIndex = 0;
  deletePoly: any;
  isShow = false;
  username = "";
  description = ""

  constructor() {}

  ngOnInit(): void {
    //POLYGON INIT
    this.canvas = new fabric.Canvas('canvasID', { fireRightClick: true });

    this.createPolyObj();
    this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
  }

  create(){
    this.polyIndex++;
    this.createPolyObj();
  }

  createPolyObj(){
    this.polygon = new fabric.Polygon(this.points, {
      left: 0,
      top: 0,
      fill: 'rgba(0,0,0,0)',
      strokeWidth: 1,
      stroke: 'lightgrey',
      scaleX: 1,
      scaleY: 1,
      objectCaching: false,
      transparentCorners: false,
      cornerColor: 'blue',
      name: "",
      description : ""
    });
    this.points = [];
    this.polygon.points = []
    this.polygonArray.push(this.polygon);
    this.polygon = this.polygonArray[this.polyIndex];
    this.startCreatePolygon();
  }

  startCreatePolygon(){
    this.points = [];
    this.isCanvasDrawn = true;
    this.isImageDrawn = true;
  }

  deletePolygon(i: number){
    this.deletePoly = this.polygonArray[i];
    this.polygon = this.deletePoly
    this.polygon.points = []
    this.canvas.add(this.deletePoly);
    this.polygonArray.splice(i, 1);
    this.isImageDrawn = false;
  }

  updatePoly(i : number){
    this.polygon = this.polygonArray[i];
    this.Edit();
  }

  onsubmit(){
    this.polygon.name = this.username;
    this.polygon.description = this.description;
    this.polygonArray[this.polyIndex].name = this.username;
    this.polygonArray[this.polyIndex].description = this.description;
    this.isShow = false;
    this.username = "";
    this.description = "";
  }

  ngAfterViewInit(): void {
    this.canvas.on('mouse:up', options => {
      if (options.button === 1) {
        this.getClickCoords(options.e);
      }
    });

    this.canvas.on('mouse:down', event => {
      if (event.button === 3) {
        if (this.points.length < 4) {
          this.isPolygonDrawn = false;
        } else {
          this.makePolygon();
          this.isPolygonDrawn = true;
          this.isShow = true;
        }
      }
    });
  }

  selectFile(event: any): void {
    var canvas = this.canvas;
    if (event.target.files) {
      var reader = new FileReader();
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.canvas.setHeight(400);
        this.canvas.setWidth(400);
        fabric.Image.fromURL(this.url, function(img) {
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height
          });
        });
      };
      this.isImageDrawn = true;
    }
  }

  getClickCoords(event: any) {
    
    if (this.isCanvasDrawn && this.isImageDrawn) {
      this.newPt = {
        x: event.layerX,
        y: event.layerY
      };
      this.points.push(this.newPt);
      this.polygon.points.push(this.newPt);
      this.canvas.add(this.polygon);
      // if (this.points.length > 3) {
      //   this.isPolygonDrawn = true;
      // }
    }
  }

  

  makePolygon() {
    this.isImageDrawn = false;
    console.log(this.points);
    this.isShow = true;
  }

  

  copyCoords() {
    console.log(this.points)
    if (this.points.length >= 2) {
      let polygonStr = 'Coords Array (';
      let close = ')';
      let sp = ' ';
      let com = ', ';
      for (let i = 0; i < this.points.length - 1; i++) {
        let tempX = (this.points[i].x / 400).toFixed(10);
        let tempY = (this.points[i].y / 400).toFixed(10);
        tempX = tempX.toString();
        tempY = tempY.toString();
        polygonStr = polygonStr.concat(tempX, sp, tempY, com);
      }
      let last = this.points[this.points.length - 1];
      let tempX = (last.x / 400).toFixed(10);
      let tempY = (last.y / 400).toFixed(10);
      tempX = tempX.toString();
      tempY = tempY.toString();
      polygonStr = polygonStr.concat(tempX, sp, tempY, close);
      console.log(polygonStr);

      //Copying Polygon to clipboard
      let el = document.createElement('textarea');
      el.value = polygonStr;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  }

  //POLYGON EDIT
  public Edit() {
    function polygonPositionHandler(dim, finalMatrix, fabricObject) {
      let x =
          fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
        y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
      return fabric.util.transformPoint(
        new fabric.Point(x, y),
        fabric.util.multiplyTransformMatrices(
          fabricObject.canvas.viewportTransform,
          fabricObject.calcTransformMatrix()
        )
      );
    }
    function anchorWrapper(anchorIndex, fn) {
      return function(eventData, transform, x, y) {
        var fabricObject = transform.target,
          absolutePoint = fabric.util.transformPoint(
            new fabric.Point(
              fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
              fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y
            ),
            fabricObject.calcTransformMatrix()
          ),
          actionPerformed = fn(eventData, transform, x, y),
          newDim = fabricObject._setPositionDimensions({}),
          polygonBaseSize = fabricObject._getNonTransformedDimensions(),
          newX =
            (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
            polygonBaseSize.x,
          newY =
            (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
            polygonBaseSize.y;
        fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
        return actionPerformed;
      };
    }
    function actionHandler(eventData, transform, x, y) {
      var polygon = transform.target,
        currentControl = polygon.controls[polygon.__corner],
        mouseLocalPosition = polygon.toLocalPoint(
          new fabric.Point(x, y),
          'center',
          'center'
        ),
        polygonBaseSize = polygon._getNonTransformedDimensions(),
        size = polygon._getTransformedDimensions(0, 0),
        finalPointPosition = {
          x:
            (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
            polygon.pathOffset.x,
          y:
            (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
            polygon.pathOffset.y
        };
      polygon.points[currentControl.pointIndex] = finalPointPosition;
      return true;
    }
    let poly = this.canvas.getObjects()[0];
    this.canvas.setActiveObject(poly);
    poly.edit = !poly.edit;
    if (poly.edit) {
      let lastControl = poly.points.length - 1;
      poly.cornerStyle = 'circle';
      poly.cornerColor = 'rgba(0,0,255,0.5)';
      poly.controls = poly.points.reduce(function(acc, point, index) {
        acc['p' + index] = new fabric['Control']({
          pointIndex: index,
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(
            index > 0 ? index - 1 : lastControl,
            actionHandler
          ),
          actionName: 'modifyPolygon'
        });
        return acc;
      }, {});
    }

    poly.hasBorders = !poly.edit;
    this.canvas.requestRenderAll();
  }
}
