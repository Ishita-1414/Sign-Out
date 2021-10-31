// -----JS CODE-----
//@input Asset.Texture inputTexture
//@input bool advancedSetup
//@input Asset.Material blurPass {"showIf":"advancedSetup","hint":"material for blur passes"}
//@input Asset.Material smooth {"showIf":"advancedSetup","hint":"material for 3rd pass"}
function createCameraToRenderLayer(layer) {
    var camera = script.getSceneObject().createComponent('Camera');
    camera.renderLayer = layer
    return camera;
}

function createMeshForPass(layer, material, renderOrder) {
    var meshSceneObj = scene.createSceneObject("")
    meshSceneObj.layer = layer
    var mesh = meshSceneObj.createComponent("PostEffectVisual");
    mesh.mainMaterial = material;
    mesh.setRenderOrder(renderOrder);
    return mesh
}

var intTextureSize = new vec2(90, 160)
var intTextureSize2 = new vec2(-1, -1)
//var intTextureSize2 = new vec2(360, 720)

function createBlur(texSize, renderLayer, camRO, camIN) {
    // construct meshes
    var blur1 = script.blurPass.clone()
    blur1.mainPass.blurDirection = new vec2(1.0, 0)
    var mesh1 = createMeshForPass(renderLayer, blur1, 0)

    var blur2 = script.blurPass.clone()
    blur2.mainPass.blurDirection = new vec2(0, 1.0)
    var mesh2 = createMeshForPass(renderLayer, blur2, 1)

    // render target
    var intTexture = scene.createRenderTargetTexture()
    if (texSize.x>0) {
        intTexture.control.useScreenResolution = false;
        intTexture.control.resolution = texSize
    } else {
        intTexture.control.useScreenResolution = true;
    }
    intTexture.control.inputTexture = camIN


    // Camera for downsample
    var gaussCam = createCameraToRenderLayer(renderLayer);
    gaussCam.renderTarget = intTexture
    gaussCam.renderOrder = camRO
    return intTexture
}
var GaussRenderLayer2 = LayerSet.makeUnique();
var GaussRenderLayer = LayerSet.makeUnique();
var intTexture2 = createBlur(intTextureSize2, GaussRenderLayer2, -2, script.inputTexture)
var intTexture1 = createBlur(intTextureSize, GaussRenderLayer, -1, intTexture2)

script.smooth.mainPass.mainTexture = script.inputTexture
script.smooth.mainPass.gaussTexture = intTexture1
script.smooth.mainPass.gaussTexture2 = intTexture2
script.smooth.mainPass.usharpen = script.usharpen ? 1.0 : 0.0

