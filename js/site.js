'use strict';

var webix, mixpanel;

webix.ready(function() {

  var pager = new webix.ui({
    container: 'pager',
    view: 'pager',
    template: '{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}',
    size: 17,
    group: 5
  });

  var grid = new webix.ui({
    container:'container',
    view: 'datatable',
    datatype: 'json',
    autoheight:true,
    autowidth:true,
    columns: [
      { id: 'name', header: ['Source', {content: 'textFilter'}], sort: 'string', width: 150 },
      { id: 'provider', header: ['Parent Company', {content: 'textFilter'}], sort: 'string' },
      { id: 'asset_group', header: ['Asset Group', {content: 'textFilter'}], sort: 'string', width: 170 },
      { id: 'explicitly_assigned', header: ['Explicit', {content: 'selectFilter'}], sort: 'string', adjust: 'header'  },
      { id: 'category', header: ['Category', {content: 'textFilter'}], sort: 'string', width: 150},
      { id: 'languages', header: ['Languages', {content: 'textFilter'}], sort: 'string' },
      { id: 'country', header: ['Country', {content: 'selectFilter'}], sort: 'string', adjust: 'header' },
      { id: 'approval_required', header: ['Approval', {content: 'selectFilter'}], adjust: 'header' },
      { id: 'tier', header: ['Tier', {content: 'selectFilter'}] },
      { id:'images_available', header: ['Images', {content: 'selectFilter'}], adjust: 'header' },
      { id: 'volume_past_30_days', header: '30 Day Volume', sort: 'int', width: 120 }
    ],
    url: 'data/sources.json',
    pager: pager,
    select:'row',
    clipboard: 'repeat',
    resizeColumn: true,
    on:{
        onBeforeLoad:function(){
          this.showOverlay('Loading...');
        },
        onAfterLoad:function(){
          this.hideOverlay();
          mixpanel.track('Page Loaded', {'Page Loaded': true});
        }
    },
  });
  //TODO - Move all logic to the prototypes
  grid.getFilterNameById = function (id) {
    return this.getColumnConfig(id).header[0].text;
  };

  grid.getAllCurrentFilters = function () {
    var filters = ['name', 'provider', 'asset_group', 'category', 'languages',
                   'country', 'approval_required', 'tier', 'images_available'];

    var properties = {};

    filters.forEach(function (id) {
      var name = grid.getFilterNameById(id);
      var value = grid.getFilter(id).value;

      if (value) {
        properties['Filter - '+name] = value;
      }
    });

    return properties;
  };

  grid.attachEvent('onAfterFilter', function() {
    var currentFilters = this.getAllCurrentFilters();
    mixpanel.track('Filters Applied', currentFilters);
  });

  pager.attachEvent('onItemClick', function (id) {
    var properties = grid.getAllCurrentFilters() || {};
    properties['Pager Button'] = id;
    mixpanel.track('Pagination', properties);
  });
});