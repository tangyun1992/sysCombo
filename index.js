/**
 * Created by hth on 2017/6/7.
 */

define(function(require, exports, module) {

    var R_SelectionForm = require('./selectionForm');
    var R_WinTriggerField = require('common/widget/form/WinTriggerField');

    var Combo = Ext.extend(R_WinTriggerField, {

        displayCnt : 3,

        forAdmin : false,

        createFormWindow : function(formConfig){

            var win = new SF.form.FormWindow({
                title : _('选择业务系统'),
                width : 900,
                bodyStyle:'padding:10px',
                form : new R_SelectionForm(formConfig)
            });

            return win;
        },

        setJsonValue : function (v) {

            var names = [];

            this.selectData = v;

            Ext.each(this.selectData, function (item) {
                names.push(item.name);
            });

            this.setValue(names.join(','));

        },

        getJsonValue : function () {
            return this.selectData || null;
        }
    });

    Ext.reg('syscombo', Combo);

    module.exports = Combo;

});