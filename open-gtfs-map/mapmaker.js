var mapFromGTFS = function(gtfs_url) {
    return {map: 'MapMap', errors: [{msg: 'Error: GTFS feed not found'}]};
};

module.exports = mapFromGTFS;