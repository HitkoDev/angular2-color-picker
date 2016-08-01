System.register(['./app/color-picker/color-picker.service', './app/color-picker/color-picker.directive', './app/color-picker/classes'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters:[
            function (color_picker_service_1_1) {
                exportStar_1(color_picker_service_1_1);
            },
            function (color_picker_directive_1_1) {
                exportStar_1(color_picker_directive_1_1);
            },
            function (classes_1_1) {
                exportStar_1(classes_1_1);
            }],
        execute: function() {
        }
    }
});
//# sourceMappingURL=index.js.map