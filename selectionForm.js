/**
 * Created by hth on 2017/6/7.
 */

define(function(require, exports, module) {

    var R_Grid = require('./grid');
    var R_List = require('./list');
    var R_LeftMenuView = require('home/mod-component/tpl/menu/LeftMenuView');

    var Form = Ext.extend(SF.form.Form, {

        valueField : 'list',

        height: 450,

        getFieldSection : function () {
            var me = this;
            var fs = Form.superclass.getFieldSection.call(me);

            // 已经封装过了，直接返回
            if(fs.valueField){
                return fs;
            }
            fs.valueField = me.valueField;

            if(!me.hasHiddenId){
                // 直接返回list的数据，不需要list的那层
                fs.getJsonValue = function () {
                    return this.fields.get(this.valueField).getJsonValue();
                };
            }
            // 因为需要异步获取数据，设值操作转由afterFormEdit管理
            fs.setJsonValue = Ext.emptyFn;

            return fs;
        },

        initComponent : function () {
            var me = this;

            me.layout = {
                type :'hbox',
                align : 'stretch'
            };

            me.items = [
                {
                    xtype: 'panel',
                    title: _('分类'),
                    width: 160,
                    items: [me.menuView = new R_LeftMenuView({
                        menu : [],
                        listeners : {
                            menuselected: this.loadGridData,
                            scope : this
                        }
                    })]
                },

                {xtype : 'box', width:10},

                me.grid = new R_Grid({
                    border : true,
                    flex:1
                }),

                {xtype : 'box', width:10},

                me.list = new R_List({
                    itemId : 'list',
                    name : me.valueField,
                    width:200
                })
            ];

            Form.superclass.initComponent.call(me);

            this.bindEvents();
        },

        bindEvents: function () {

            var sm = this.grid.getSelectionModel();

            this.grid.store.on('load', this.updateMenu, this);

            sm.on({
                rowselect: this.addListData,
                rowdeselect: this.delListData,
                scope: this
            });

            this.list.on('delItem', this.deselectGridRow, this);

            sm.onRefresh = this.onGridRefresh;

        },

        onGridRefresh: function () {

            var me = this,
                ds = me.grid.store,
                list = me.grid.ownerCt.list,
                i = 0,
                len = ds.getCount();

            me.silent = true;
            me.clearSelections(true);
            for(; i < len; i++) {
                if(list.hasRecord(ds.getAt(i).data.name)) {
                    me.selectRow(i, true);
                }
            }
            this.silent = false;
        },

        addListData: function (sm, index, rd) {
            var v = {
                id : rd.json.name,
                name : rd.json.name,
                desc: rd.json.desc
            }

            this.list.toggleRecord(v, true);
        },

        delListData: function (sm, index, rd) {
            this.list.toggleRecord({
                id : rd.json.name,
                name : rd.json.name,
                desc : rd.json.desc
            }, false);
        },

        deselectGridRow: function (ds, params) {
            var grid = this.grid;
            var store = grid.store;
            var index;

            if((index = store.indexOfId(params.name)) != -1) {
                grid.getSelectionModel().deselectRow(index);
            }
        },

        loadGridData: function (menuView, index, id) {

            this.grid.setGridFilterType(id);

            this.grid.filterGridData();

        },

        updateMenu: function (store) {
            var jsonData = store.reader.jsonData;

            this.menuView.setJsonValue([{
                id:'all',
                str:_('全部（{0}）', jsonData.allTotel)
            },{
                id:'main',
                str:_('核心业务系统（{0}）', jsonData.mainTotel)
            },{
                id:'other',
                str:_('其他业务（{0}）', jsonData.otherTotel)
            }]);

            this.menuView.select(0);

        },

        afterFormEdit : function (openConfig) {
            var me = this;
            var data = openConfig.value;

            if (me.grid.rendered) {
                me.grid.reset();
            }
            //	已选列表初始化
            me.list.setJsonValue(data);

            me.grid.reload();
        },

        onDestroy : function () {
            var me = this;
            me.tree = null;
            me.grid = null;
            me.list = null;

            Form.superclass.onDestroy.call(me);
        }
    });

    module.exports = Form;

});