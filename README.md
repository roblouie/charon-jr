# js13k-typescript-starter
JS13K Starter Kit

A JS13K Game starter kit with TypeScript and Webpack using:
* TypeScript
* Webpack
* Google Closure Compiler for minification
* Roadroller for code compression
* ECT for Zipping

## Quick Start

Install dependencies: `npm install`

Run Server: `npm run serve`

Build: `npm run build`

## Starter Kit Build Features

*Note: This starter was designed with minimal css in mind, so as it stands it just uses styles in a `style` tag in `index.html`*

While developing, simply use `npm run serve` to start a server and get hot module reloading.

For building, `npm run build` leverages the included custom plugin `webpack-super-minify`, which:
* Minifies your html file and the embedded css
* Stips this from your html and instead prepends your transpiled js code with a `document.write` call that writes your html and css from JS
* Runs google closure compiler on your code
* Runs Roadroller on the closure minified code
* Replaces your `index.html` with only a script tag and the roadroller'd JS
* Places this `index.html` file in the folder `dist/super-minified` along with any other assets from the `static-assets` folder
* Zips everything up and places it in `dist/super-minified/index.zip`

So when you complete your build you end up with the following structure in your dist folder:
```
dist/
    index.html   <-- regular webpack built index.html
    bundle.js    <-- regular webpack transpiled and bundled code
    ball.png     <-- any assets are copied from ./static-assets to the root of dist for smaller size
    super-minified/
        index.html   <-- This should contain only a <script> tag with the code
        ball.png     <-- A copy of any assets also ends up here for easy testing of your app
        index.zip    <-- index.html plus any assets zipped up with ECT
```

This structure makes it easier to test out the build process. Files directly in dist only go through regular webpack bundling.
Files in super-minified have the closure compiler and roadroller applied. These are used for zipping but the unzipped copy is left behind so you can validate
the code still works without unzipping.
Finally you have your index.zip to distribute

## Starter Kit "Game" Features

The starter kit is designed as simply a starting point with some helpful features. The included features are minimal and can easily be changed or removed.
There's a simple state machine that is used to toggle between the game and a menu. This state machine can also be useful for player or enemy states.
There's also a simple singleton `drawEngine` for drawing with the canvas anywhere easily, as well as a simple `controls` interface.

These features allow a simple menu to be shown with options to start the game or toggle fullscreen. Use WASD and Enter to select options. 
You can exit the game with Escape.
