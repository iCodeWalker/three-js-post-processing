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
