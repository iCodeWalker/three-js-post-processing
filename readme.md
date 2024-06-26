# Three.js Post processing

1. Post Processing is adding effects to the final image and this is usually done for film making, but we can do it in webGL also. It can be subtle (not very strong) to improve the image slightly or to create hugr effects.

   Post processing can be done for:

   1. Depth of field
   2. Bloom
   3. God ray
   4. Motion blur
   5. Glitch effect
   6. Outlines
   7. Color Variations
   8. Antialiasing
   9. Reflecttions and Refractions
   10. etc

2. In Post processing instead of puting the renderer (The object) inside of the canvas we will put it inside the render target (or Buffer). Render target is like a texture, It's like rendering in a texture so it can be used later.

Now we create a new scene with a camera, and we will create a plane in this camera, the camera is facing the plane and covering the whole view, Now we take the texture and put it on the plane.

The plane is not a basic three.js material like MeshStandardMaterial, but it is a ShaderMaterial, and instead of just drawing that texture on the plane we are going to add effects in the vertex shader.

And with the second camera we will do a render and put it on the screen.

3. In Three.js 'effects' are called 'passes'.

4. If we want to have multiple effects or passes we have to use another render target.
   Create another render target.
   Now instead of puting the second camera render on the screen, we will put in the 2nd render target.
   Now we put the effects in the 2nd render target, and put this 2nd render target back to the plane.

   We need two render target because we can't read and write from the same render target.

5. The final pass is put on the canvas.

6. We don't have to do all this stuff, it is done automatically by 'EffectComposer' class.

7. EffectComposer

   1. The EffectComposer requires to arguments renderer, renderTarget.
   2. As the first pass, we usually start from a render of the scene. 'RenderPass'. Import 'RenderPass'.
   3. RenderPass is something that takes the scene, do a render and put it on the screen. So we need a first renderpass that will just take the scene, do a render and put it inside the redner target, or if it is the only pass it will directly put it in the screen, as there is no need to use a renderTarget if it's just single render.

   4. Instantiate an EffectComposer, use the renderer as parameter, set the pixel ratio with setPixelRatio(...) and resize it with setSize()

   5. Instantiate a RenderPass and add it to effectComposer with addPass(...)

   6. In tick() function we need to replace the renderer.render(...) with effectComposer.render()

8. Dot Screen Pass

   1. Import the DotScreenPass.
   2. Instantiate it and add it to the effectComposer after the renderPass.
   3. We can disable the pass with enabled = false.

9. Glitch Pass

   1. Import the GlitchPass.
   2. Instantiate it and add it to the effectComposer.
   3. Some passes have editable properties. Change the 'goWild' property to true

10. RGB Shift Pass

    1. Import the RGBShift. But RGBShift is available as a shaders,and We need to use it with a 'ShaderPass'.
    2. Instantiate the ShaderPass with the RGBShiftShader as a parameter and add it to effectComposer.

    3. FIXING THE COLOR:  
       IMPORTANT POINT :
       "Since we are using EffectComposer, the colors are darker."

       This is because the renderer.outputEncoding = THREE.sRGBEncoding dosen't work anymore because we are rendering inside the render target and those render targets dosen't support encoding.

       The EffectComposer dosen't support the encoding, but we can add a pass that can fix the color.
       This pass is "GammaCorrectionShader" and it will convert the linear encoding to a sRGB encoding.

       GammaCorrectionShader is not great for performances.

11. GammaCorrectionShader

    1. import GammaCorrectionShader shader.
    2. Instantiate the ShaderPass with the GammaCorrectionShader as a parameter and add it to effectComposer.

12. Resizing :

    1. We did the resizing on the renderer, but now we have to do it on the effectComposer too.
    2. The resizing isn't handle properly, we need to call the setSize(...) on effectComposer inside the resize callback function.

13. Fixing AntiAlias (fixing stair effects on the corners)

    1. EffectComposer is using render target without the antialias.
    2. Provide our own render target on which we add the antialias, but that won't work in all modern browsers.
    3. Use a pass to do the antialias but with lesser performance and a slightly different result.
    4. A combination of the two previous options where we test if the browser supports the antialias on the render target, and if not, we use an antialias pass.

    5. Adding Antialias to the render target:
       by default EffectComposer is using a WebGLRenderTarget without the antialias.

       The "WebGLRenderTarget" can receive a third parameter that is an object and that will contain some options. The only property that we need to set is the samples

       const renderTarget = new THREE.WebGLRenderTarget(800, 600, { samples : 2});

       The more samples, the better the antialias. 0 corresponds to no samples.
       Every increase on this value will lower the performance.

       This won't work for all browser and to overcome this we need to use pass.

    6. Using an antialias pass:
       Using different passes

       1. FXAA : Performant, but the result is just ok and can be blurry.
       2. SMAA : Usually better than FXAA but less performant - not to be confused with MSAA (by default)
       3. SSAA : Best quality but the worst performance.
       4. TAA : Performant but limited.

       import SMAAPass, instantiate it and add it to effectComposer, Do it after the "gammaCorrectionPass"

       AnitAliasing pass should be after gammaCorrectionPass

       Because the SMAA pass we analyse the pixel it will check the pixel compare to the neighbour's pixels and stuff like that and decides if those needs to be blurred.
       And if we do it before the gammaCorrectionPass than it will compare the pixels that will change after.

    7. Combining both solutions:
       If the 'samples' property isn't supported by the browser (the browser is using WebGL 1), it'll be ignored. And will be going to use SMAA pass.

       We need to test if the user has a pixel ratio to 1 and if he dosen't support WebGL 2, if so, we add the SMAA Pass.

       To know if the browser supports WebGL 2 we can use capabilities property on the render.

14. UnrealBloomPass :

    1. Import the UnrealBloomPass.
    2. Instantiate it and add it to the effectComposer.

    3. three main parameters to control:
       Strength : How strong is the glow.
       radius : How far that brightness can spread.
       threshold : At what luminosity limit things start to glow.

15. Custom Pass : (Creating our own pass)

    1. It's like creating our own shader.
    2. Create a shader which is an object with following properties :

       1. uniforms : Same format as of uniforms for shaders.
       2. vertexShader : This one has almost always the same code and will put the plane in front of the view.
       3. fragmentShader : The fragment shader that will do the post-processing effect.

    3. After creating the Custom pass, we need the texture from the previous pass, set a tDiffuse uniform to null and EffectComposer will update it automatically.
       uniforms: {
       tDiffuse: { value: null },
       },

    4. In order to pick the right pixel colors on that 'tDiffuse' texture, we need to use texture2D(...) and provide the uv coordinates.

    5. Create a 'uTint' uniform to control the tint.

16. Displacement Pass :
    We will deform the uv coordinates to create a displacement effect.

    Create a new Shader named 'DisplacementShader', then a new pass named 'displacementPass' from the ShaderPass and add it to 'effectComposer'.

17. Futuristic displacement pass :

    Instead of sinus displacement we can use a texture.
    Add a uNormalMap uniform.
