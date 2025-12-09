/*
    AzO Script 1.3
    Dockable Panel for After Effects
*/

var azoScript = (function(thisObj) {
    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "AzO Script 1.3", undefined, {resizeable: true});
        panel.orientation = "column";
        panel.alignChildren = ["fill", "fill"];
        panel.spacing = 5;
        panel.margins = 5;
        
        // Anchor Point Group
        var apGroup = panel.add("group");
        apGroup.orientation = "column";
        apGroup.alignment = ["fill", "fill"];
        apGroup.alignChildren = ["fill", "fill"];
        apGroup.spacing = 2;
        
        var row1 = apGroup.add("group");
        row1.alignment = ["fill", "fill"];
        row1.alignChildren = ["fill", "fill"];
        var btnTL = row1.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnTL.text = "\u2196";
        var btnTC = row1.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnTC.text = "\u2191";
        var btnTR = row1.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnTR.text = "\u2197";
        
        var row2 = apGroup.add("group");
        row2.alignment = ["fill", "fill"];
        row2.alignChildren = ["fill", "fill"];
        var btnML = row2.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnML.text = "\u2190";
        var btnMC = row2.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnMC.text = "\u25CF";
        var btnMR = row2.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnMR.text = "\u2192";
        
        var row3 = apGroup.add("group");
        row3.alignment = ["fill", "fill"];
        row3.alignChildren = ["fill", "fill"];
        var btnBL = row3.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnBL.text = "\u2199";
        var btnBC = row3.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnBC.text = "\u2193";
        var btnBR = row3.add("iconbutton", undefined, undefined, {style: "toolbutton"});
        btnBR.text = "\u2198";

        // Tools Group
        var toolsGroup = panel.add("group");
        toolsGroup.alignment = ["fill", "bottom"];
        toolsGroup.alignChildren = ["fill", "fill"];
        toolsGroup.spacing = 2;
        
        var btnPurge = toolsGroup.add("button", undefined, "Purge");
        var btnNull = toolsGroup.add("button", undefined, "Null");
        var btnAdj = toolsGroup.add("button", undefined, "Adj");
        var btnText = toolsGroup.add("button", undefined, "Text");

        // Anchor Point Events
        btnTL.onClick = function() { moveAnchor("TL"); };
        btnTC.onClick = function() { moveAnchor("TC"); };
        btnTR.onClick = function() { moveAnchor("TR"); };
        btnML.onClick = function() { moveAnchor("ML"); };
        btnMC.onClick = function() { moveAnchor("MC"); };
        btnMR.onClick = function() { moveAnchor("MR"); };
        btnBL.onClick = function() { moveAnchor("BL"); };
        btnBC.onClick = function() { moveAnchor("BC"); };
        btnBR.onClick = function() { moveAnchor("BR"); };

        // Tools Events
        btnPurge.onClick = purgeCache;
        btnNull.onClick = function() { addLayer("null"); };
        btnAdj.onClick = function() { addLayer("adjustment"); };
        btnText.onClick = function() { addLayer("text"); };

        // === ANCHOR POINT FUNCTIONS ===
        function moveAnchor(pos) {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert("Please open a Composition first!");
                return;
            }
            
            var layers = comp.selectedLayers;
            if (layers.length === 0) {
                alert("Please select at least one layer!");
                return;
            }
            
            app.beginUndoGroup("Move Anchor Point");
            
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var rect = getLayerRect(layer, comp.time);
                var newAnchor;
                
                var left = rect.left;
                var top = rect.top;
                var right = rect.left + rect.width;
                var bottom = rect.top + rect.height;
                var centerX = rect.left + rect.width / 2;
                var centerY = rect.top + rect.height / 2;
                
                if (pos === "TL") newAnchor = [left, top];
                else if (pos === "TC") newAnchor = [centerX, top];
                else if (pos === "TR") newAnchor = [right, top];
                else if (pos === "ML") newAnchor = [left, centerY];
                else if (pos === "MC") newAnchor = [centerX, centerY];
                else if (pos === "MR") newAnchor = [right, centerY];
                else if (pos === "BL") newAnchor = [left, bottom];
                else if (pos === "BC") newAnchor = [centerX, bottom];
                else if (pos === "BR") newAnchor = [right, bottom];
                
                setAnchorPoint(layer, newAnchor);
            }
            
            app.endUndoGroup();
        }

        function getLayerRect(layer, time) {
            if (layer.sourceRectAtTime) {
                var rect = layer.sourceRectAtTime(time, false);
                return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
            }
            var w = 100, h = 100;
            try {
                if (layer.source && layer.source.width) {
                    w = layer.source.width;
                    h = layer.source.height;
                }
            } catch(e) {}
            return { left: 0, top: 0, width: w, height: h };
        }

        function setAnchorPoint(layer, newAnchor) {
            try {
                var oldAnchor = layer.anchorPoint.value;
                var position = layer.position.value;
                var scale = layer.scale.value;
                var deltaX = (newAnchor[0] - oldAnchor[0]) * (scale[0] / 100);
                var deltaY = (newAnchor[1] - oldAnchor[1]) * (scale[1] / 100);
                layer.anchorPoint.setValue(newAnchor);
                layer.position.setValue([position[0] + deltaX, position[1] + deltaY]);
            } catch(e) {
                alert("Error: " + e.toString());
            }
        }

        // === TOOLS FUNCTIONS ===
        function purgeCache() {
            app.purge(PurgeTarget.ALL_CACHES);
            alert("Cache purged!");
        }

        function addLayer(type) {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert("Please open a Composition first!");
                return;
            }
            
            app.beginUndoGroup("Add " + type + " layer");
            
            var layers = comp.selectedLayers;
            var newLayer;
            var inPoint, outPoint;
            
            if (layers.length > 0) {
                inPoint = layers[0].inPoint;
                outPoint = layers[0].outPoint;
            } else {
                inPoint = 0;
                outPoint = comp.duration;
            }
            
            if (type === "null") {
                newLayer = comp.layers.addNull();
                newLayer.name = "Null Control";
            } else if (type === "adjustment") {
                newLayer = comp.layers.addSolid([1, 1, 1], "Adjustment Layer", comp.width, comp.height, 1);
                newLayer.adjustmentLayer = true;
                newLayer.name = "Adjustment Layer";
            } else if (type === "text") {
                newLayer = comp.layers.addText("Text");
                newLayer.name = "Text Layer";
                newLayer.position.setValue([comp.width / 2, comp.height / 2]);
            }
            
            newLayer.startTime = inPoint;
            newLayer.outPoint = outPoint;
            
            if (layers.length > 0 && (type === "null" || type === "adjustment")) {
                newLayer.moveBefore(layers[0]);
                if (type === "null") {
                    for (var i = 0; i < layers.length; i++) {
                        layers[i].parent = newLayer;
                    }
                }
            }
            
            app.endUndoGroup();
        }

        // Resize handling
        panel.onResizing = panel.onResize = function() {
            this.layout.resize();
        };

        panel.layout.layout(true);
        return panel;
    }

    var myPanel = buildUI(thisObj);
    if (myPanel instanceof Window) {
        myPanel.center();
        myPanel.show();
    }
    return myPanel;
})(this);
