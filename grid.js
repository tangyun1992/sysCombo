/**
 * Created by hth on 2017/6/7.
 */

define(function(require, exports, module) {

    var R_SearchField = require('common/widget/form/SearchField/index');

    //处理后台数据转换
    var Reader = Ext.extend(Ext.data.JsonReader, {
        read : function(response){
            var o = response.getJsonData(); // 使用新的Json获取接口
            if (!o) {
                throw {
                    message : 'JsonReader.read: Json object not found'
                };
            }

            var total = o.data.length,
                other = 0;

            Ext.each(o.data, function (item) {
                if (item.type === 'other') {
                    other ++;
                }
                item.type += '|all';
            });

            o.allTotel = total;
            o.otherTotel = other;
            o.mainTotel = total - other;

            return this.readRecords(o);
        }
    });

    var Grid = Ext.extend(SF.grid.GeneralGrid, {

        initComponent : function () {
            this.createTbar();
            this.createStore();
            this.createColumns();
            this.callParent(arguments);
        },

        filterField: ['name', 'desc'],

        createTbar: function() {
            this.tbar = new Ext.Toolbar({
                items: ['->', this.searchField = new R_SearchField({
                    itemId: 'search',
                    width: 100,
                    searchFn: this.onFilterChange,
                    scope: this
                })]
            });
        },

        filterGridData: function () {
            this.onFilterChange(this.searchField, this.searchField.getValue());
        },

        setGridFilterType: function (type) {
            this.gridFilterType = type;
        },

        getGridFilterType: function () {
            return this.gridFilterType || 'all';
        },


        // 准备执行本地过滤，有缓冲机制。
        onFilterChange : function(f, n, o) {
            var me = this;
            // alert(n + o); do filter operation here
            if(!this.filterTask){
                this.filterTask = new Ext.util.DelayedTask(function(v){
                    // 增加多字段过滤的功能
                    var field = this.filterField, matcher;
                    var s = this.getStore();
                    var anyMatch = this.filterAnyMatch,
                        caseSensitive = this.filterCaseSensitive;
                    if(s){
                        if(Ext.isArray(field)){
                            matcher = s.data.createValueMatcher(v, anyMatch, caseSensitive);
                            s.filterBy(function(r){
                                var i, data = r.data;
                                for(i=0; i<field.length; i++){
                                    if(data.type.indexOf(me.getGridFilterType()) > -1 && matcher.test(data[field[i]])){
                                        return true;
                                    }
                                }
                                return false;
                            });
                        }else{
                            s.filter(field, v, anyMatch, caseSensitive);
                        }
                        SF.log("do local filter");
                    }
                }, this);
            }
            this.filterTask.delay(50, null, null, [n]);
        },

        createStore: function(){
            this.store = new Ext.data.Store({
                autoLoad: true,
                url: 'aaa' || DVS.data.url,
                reader: new Reader ({
                    root:'data',
                    idProperty: 'name',
                    fields: ['name', 'desc', 'id', 'type']
                }),
                baseParams: {
                    opr: 'list',
                    app_args: {
                        name: "app.query.admin@dtrn",
                        options: {}
                    }
                }
            });
        },

        createColumns : function () {
            this.columns = [
                this.sm = new Ext.grid.CheckboxSelectionModel(),
                {
                    header : _("名称"),
                    width : 0.5,
                    dataIndex : "name"
                },
                {
                    header : _("描述"),
                    width : 0.45,
                    dataIndex : "desc",
                    renderer : 'htmlEncode'
                }
            ];
        },

        reset : function () {
            //	清除表格的选择状态
            this.getSelectionModel().clearSelections(true);

            var tbar = this.getTopToolbar();
            tbar.getComponent('search').reset();
        }
    });

    module.exports = Grid;

});