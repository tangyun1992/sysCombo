/**
 * Created by hth on 2017/6/7.
 */

define(function(require, exports, module) {

    var  R_ListView = require('common/widget/list/ListView/index');

    /**
     * 已选列表的组件
     */
    var List = Ext.extend(Ext.Panel, {
        title : _('已选列表'),

        autoScroll : true,

        displayField: 'name',

        valueField : 'id',

        initComponent : function () {
            var me = this;

            me.list = me.items = new R_ListView({
                displayField: me.displayField
            });

            List.superclass.initComponent.call(me);

            me.relayEvents(me.list, ['delItem','clear']);
        },

        hasRecord : function (recordId) {
            return !!this.list.findById(recordId);
        },

        toggleRecord : function (params, checked) {
            this.list.toggleItem(params, checked);
        },

        setJsonValue : function (v) {
            return this.list.setJsonValue(v);
        },

        getJsonValue : function () {
            return this.list.getJsonValue();
        }
    });

    SF.applyInterface(List, SF.form.JsonField);

    module.exports = List;

});