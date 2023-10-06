# Mozilla PDF Viewer

## Setup

First, download a zip of its [latest release](https://github.com/mozilla/pdf.js/releases).

Next, install `gulp` and build.

```bash
sudo npm install -g gulp-cli
gulp generic
```

Finally, upload the files in `build/generic/build` to your webserver. These can be served as static files. On Django, just place in your directory configured for static files.

## Usage

Navigate to `http://<server_name_or_ip>/path/to/uploaded/static/generic/web/viewer.html`. If you included the default example pdf `compressed.tracemonkey-pldi-09.pdf` in your webserver, it should appear at this url. If not, you'll just see the viewer with no pdf and some console errors saying it couldn't find it.

If you wanted to change the default pdf shown, modify this line in `web/viewer.js`. This can be a url.

```javascript
defaultOptions.defaultUrl = {
    value: "compressed.tracemonkey-pldi-09.pdf", // MODIFY ME!!
    kind: OptionKind.VIEWER
};
```

To show arbitrary pdfs, pass the `file` GET param to this url. For example, `http://<server_name_or_ip>/path/to/uploaded/static/generic/web/viewer.html?file=/path/to/pdf`. This can be an absolute or relative url, or a filepath on the server. Note that cross origin requests are disabled by default but can be configured to work. See the docs for more information.

## Custom URL

In Django, I've also made it so I can server the viewer from a custom URL. This required me copying the `web/viewer.html` into a Django template, and updating all static file references to use "absolute" paths to my staticfiles directory. Note that outside the `web/viewer.html` template, I could not use `{{ STATIC_URL }}` to reference this, I needed to just use `/static/`, which is what it would have expanded to. This is because these files will be served by NGINX instead of Django and it can't insert its context. It will also allow the large javascript files to be cached by the browser.

A hacky way I've used the default pdf option is by making it dynamic based on the window location. This can allow you to serve a different "default" pdf depending on the path of your url. For example, my viewer was displayed at the location `/12345/preview` where `12345` was a unique id and the file could be downloaded at `/12345/download`. So, my `defaultUrl` setting looked like this:

```javascript
defaultOptions.defaultUrl = {
    value: window.location.href.replace("preview", "download"),
    kind: OptionKind.VIEWER
};
```

## Custom Initial Sidebar Width

For some applications, you may want to change the initial width of the side bar in the viewer. In my case, I wanted attachment names to display on one line instead of wrapping. I did this my modifying `web/viewer.css`, as shown below

```css
:root {
  ...
  --sidebar-width: 300px;
  ...
}
```

## Discourage Editing

The mozilla pdf viewer comes with a "Draw" feature that allows a user to mark up a pdf in the browser and then save that pdf. These edits will not appear on the file served if it is coming from a url, however the user can still save the modified pdf locally.

In an attempt to discourage this, I modified the following line in `web/viewer.js`. Before, the `disableButtons` attr defaults to `false`, but I changed this to `true` which disables both the "Text" and "Draw" options in the viewer and appears to not impact anything else.

```javascript
const editorModeChanged = (evt, disableButtons = true) => {
    ...
}
```

Keyword from above is "discourage" edits. This has no protection against the user removing the disabled attribute through dev tools and using them.

## Remove Edit Features

If you want to truly disable by completely removing the code for these options, the following must be done.

In `web/viewer.js`, the following code must be removed or commented out. Search the file for these.

```javascript
this.#bindEditorToolsListener(options);
...
...
#bindEditorToolsListener({
    editorFreeTextButton,
    editorFreeTextParamsToolbar,
    editorInkButton,
    editorInkParamsToolbar
}) {
    const editorModeChanged = (evt, disableButtons = true) => {
        const editorButtons = [{
            mode: _pdfjsLib.AnnotationEditorType.FREETEXT,
            button: editorFreeTextButton,
            toolbar: editorFreeTextParamsToolbar
        }, {
            mode: _pdfjsLib.AnnotationEditorType.INK,
            button: editorInkButton,
            toolbar: editorInkParamsToolbar
        }];
        for (const {
            mode,
            button,
            toolbar
        } of editorButtons) {
            const checked = mode === evt.mode;
            button.classList.toggle("toggled", checked);
            button.setAttribute("aria-checked", checked);
            button.disabled = disableButtons;
            toolbar?.classList.toggle("hidden", !checked);
        }
    };
    this.eventBus._on("annotationeditormodechanged", editorModeChanged);
    this.eventBus._on("toolbarreset", evt => {
        if (evt.source === this) {
            editorModeChanged({
                mode: _pdfjsLib.AnnotationEditorType.NONE
            }, true);
        }
    });
}
...
...
editorFreeTextButton: document.getElementById("editorFreeText"),
...
...
editorInkButton: document.getElementById("editorInk"),
```

In `web/viewer.html`, this section can be removed or commented out

```html
<div id="editorModeButtons" class="splitToolbarButton toggled" role="radiogroup">
    <button id="editorFreeText" class="toolbarButton" disabled="disabled" title="Text" role="radio"
        aria-checked="false" tabindex="34" data-l10n-id="editor_free_text2">
        <span data-l10n-id="editor_free_text2_label">Text</span>
    </button>
    <button id="editorInk" class="toolbarButton" disabled="disabled" title="Draw" role="radio"
        aria-checked="false" tabindex="35" data-l10n-id="editor_ink2">
        <span data-l10n-id="editor_ink2_label">Draw</span>
    </button>
</div>
```

## Remove Layers Button

By default, there is a layers button that could allow removing watermarks added with Adobe. To discourage this, you can disable the layers view.

First, comment out the HTML

```html
<button id="viewLayers" class="toolbarButton"
    title="Show Layers (double-click to reset all layers to the default state)" tabindex="5"
    data-l10n-id="layers" role="radio" aria-checked="false" aria-controls="layersView">
    <span data-l10n-id="layers_label">Layers</span>
</button>
```

Then in `web/viewer.js`, search for the string `"layersButton"` and comment out or remove those lines. In addition, remove any code using `_ui_utils.SidebarView.LAYERS`. There were lots, so I haven't included them here.

One side effect I noticed after removing is that the tray on the left doesn't automatically open anymore. If I solve that, I'll add a note about it here.

## Turn Off Form Rendering

In `web/viewer.js`, find a piece of source code that looks like the following

```js
const parameters = {
    viewport: viewport.clone({
        dontFlip: true
    }),
    div: this.div,
    annotations,
    page: this.pdfPage,
    imageResourcesPath: this.imageResourcesPath,
    ////// WHETHER OR NOT TO RENDER FORMS! //////
    renderForms: false,
    /////////////////////////////////////////////
    linkService: this.linkService,
    downloadManager: this.downloadManager,
    annotationStorage: this.annotationStorage,
    enableScripting: this.enableScripting,
    hasJSActions,
    fieldObjects,
    mouseState: this._mouseState,
    annotationCanvasMap: this._annotationCanvasMap,
    accessibilityManager: this._accessibilityManager
};
```

In this particular case, we are looking for the `renderForms` option. When set to `false`, editable form fields do not appear editable in the browser view, which may be desireable for your application.
