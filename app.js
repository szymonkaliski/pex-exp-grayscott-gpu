var Camera       = require("pex-glu").OrthographicCamera;
var Color        = require("pex-color").Color;
var GUI          = require("pex-gui").GUI;
var Glu          = require("pex-glu");
var Material     = require("pex-glu").Material;
var Materials    = require("pex-materials");
var Mesh         = require("pex-glu").Mesh;
var Plane        = require("pex-gen").Plane;
var Program      = require("pex-glu").Program;
var RenderTarget = require("pex-glu").RenderTarget;
var ScreenImage  = require("pex-glu").ScreenImage;
var Texture2D    = require("pex-glu").Texture2D;
var Vec2         = require("pex-geom").Vec2;
var Window       = require("pex-sys").Window;
var Platform     = require("pex-sys").Platform;

Window.create({
  settings: {
    width:      1280,
    height:     720,
    type:       "3d",
    fullscreen: Platform.isBrowser
  },

  init: function() {
    this.camera = new Camera(-0.5, -0.5, 1, 1);

    this.texture1 = Texture2D.create(this.width, this.height, { format: this.gl.RGBA, type: this.gl.FLOAT });
    this.texture2 = Texture2D.create(this.width, this.height, { format: this.gl.RGBA, type: this.gl.FLOAT });

    this.screenImage1 = new ScreenImage(this.texture1, 0, 0, this.width, this.height, this.width, this.height);
    this.screenImage2 = new ScreenImage(this.texture2, 0, 0, this.width, this.height, this.width, this.height);

    this.renderTarget1 = new RenderTarget(this.width, this.height, { color: this.texture1 });
    this.renderTarget2 = new RenderTarget(this.width, this.height, { color: this.texture2 });

    this.programGS     = Program.load("./grayscott.glsl");
    this.programScreen = Program.load("./screen.glsl");

    var uniformsGS = {
      screenWidth: this.width,
      screenHeight: this.height,
      source: this.texture1,
      delta: 1.0,
      feed: 0.037,
      kill: 0.06,
      brush: new Vec2(-10, -10),
      brushSize: 5.0
    };

    var uniformsScreen = {
      screenWidth: this.width,
      screenHeight: this.height,
      source: this.texture1,
      color1: Color.Black,
      color2: new Color(0.2, 0.7, 0.9, 1.0)
    };

    this.materialGS     = new Material(this.programGS, uniformsGS);
    this.materialScreen = new Material(this.programScreen, uniformsScreen);

    var plane = new Plane(1, 1);

    this.meshGS     = new Mesh(plane, this.materialGS);
    this.meshScreen = new Mesh(plane, this.materialScreen);

    this.lastUpdate = new Date().getTime();
    this.calculationSpeed = 8;

    this.shouldClean = function() {
      this.materialGS.uniforms.brush = new Vec2(-10, -10);
    }.bind(this);

    this.on("mouseMoved", function(e) {
      var vec = new Vec2(e.x / this.width, e.y / this.height);
      this.materialGS.uniforms.brush = vec;
    }.bind(this));

    this.gui = new GUI(this);
    this.gui.addTexture2D("texture1", this.texture1);
    this.gui.addTexture2D("texture2", this.texture2);
    this.gui.addParam("feed", this.materialGS.uniforms, "feed", { min: 0.001, max: 0.1 });
    this.gui.addParam("kill", this.materialGS.uniforms, "kill", { min: 0.001, max: 0.1 });
    this.gui.addParam("brush size", this.materialGS.uniforms, "brushSize", { min: 1.0, max: 100.0 });
    this.gui.addParam("ping pong count", this, "calculationSpeed", { min: 1, max: 20 });
    this.gui.addParam("color", this.materialScreen.uniforms, "color2");
    this.gui.addButton("clean", this, "shouldClean");
  },

  pingPong: function(times) {
    for (var i = 0; i < times; ++i) {
      Glu.viewport(0, 0, this.renderTarget2.width, this.renderTarget2.height);
      this.renderTarget2.bind();

      this.meshGS.material.uniforms.source = this.texture1;
      this.meshGS.draw(this.camera);

      this.renderTarget2.unbind();

      this.materialGS.uniforms.brush = new Vec2(-1, -1);

      Glu.viewport(0, 0, this.renderTarget1.width, this.renderTarget1.height);
      this.renderTarget1.bind();

      this.materialGS.uniforms.source = this.texture2;
      this.meshGS.draw(this.camera);

      this.renderTarget1.unbind();
    }
  },

  draw: function() {
    var time = new Date().getTime();
    var dt = Math.min((time - this.lastUpdate) / 10, 1);
    this.lastUpdate = time;

    this.materialGS.uniforms.delta = dt;

    this.pingPong(this.calculationSpeed);

    Glu.clearColor(Color.Black);
    Glu.viewport(0, 0, this.width, this.height);
    this.meshScreen.draw(this.camera);

    this.gui.draw();
  }
});
