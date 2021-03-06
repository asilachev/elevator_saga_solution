{
    init: function(elevators, floors) {
        var MAX_FLOOR_NUM = floors[floors.length - 1].floorNum();
        var LOAD_FACTOR_VALUE = 0.75;

        var get_elevator = function() {
            var result = elevators[elevators.length - 1];
            if (elevators.length > 1) {
                for (var i=0; i<elevators.length; i++) {
                    var e = elevators[i];
                    if (e.loadFactor() === 0) {
                        return e;
                    } else {
                        if (e.loadFactor() < result.loadFactor()) {
                            result = e;
                        }
                    }               
                }
            }
            return result;
        };

        var add_destination = function(e, num, obligatory) {
            var obligatory = obligatory || false;
            if (obligatory || e.loadFactor() < LOAD_FACTOR_VALUE) {
                var idx = e.destinationQueue.indexOf(num);
                if (e.destinationQueue.indexOf(num) === -1) {
                    e.destinationQueue.push(num);
                    update_queue(e);
                }
            }
        };

        var get_closest_values = function(a, x) {
            var lo = -1, hi = a.length;
            while (hi - lo > 1) {
                var mid = Math.round((lo + hi)/2);
                if (a[mid] <= x) {
                    lo = mid;
                } else {
                    hi = mid;
                }
            }
            if (a[lo] == x) hi = lo;
            return [a[lo], a[hi]];
        }           

        var update_queue = function(e) {
            e.destinationQueue = e.destinationQueue.filter(function(elem, pos) {
                return e.destinationQueue.indexOf(elem) == pos;
            });

            if (e.destinationQueue.length > 1) {
                var x = e.currentFloor();
                e.destinationQueue.sort(function(a, b) { return a - b });

                if (e.goingUpIndicator()) {
                    a1 = e.destinationQueue.slice(e.destinationQueue.indexOf(get_closest_values(e.destinationQueue, x)[0]))
                    a2 = e.destinationQueue.slice(0, e.destinationQueue.indexOf(get_closest_values(e.destinationQueue, x)[0])).reverse();
                    e.destinationQueue = a1.concat(a2);                
                } else {
                   a1 = e.destinationQueue.slice(0, e.destinationQueue.indexOf(get_closest_values(e.destinationQueue, x)[0])).reverse();
                   a2 = e.destinationQueue.slice(e.destinationQueue.indexOf(get_closest_values(e.destinationQueue, x)[0]));
                   e.destinationQueue = a1.concat(a2);
               }
                
                e.checkDestinationQueue();  
            }                   
        }     

        for (var i_e=0; i_e<elevators.length; i_e++) {
            var e = elevators[i_e];
            elevators.idx = i_e;
            
            add_destination(e, 0, true);

            e.on("floor_button_pressed", function(floorNum) {
                add_destination(this, floorNum, true);
            });

            e.on("passing_floor", function(floorNum, direction) {
                if (direction == "down") {
                    e.destinationQueue = e.destinationQueue.filter(function(elem, pos) {
                        return e.destinationQueue.indexOf(elem) == pos;
                    });                

                    var idx = e.destinationQueue.indexOf(floorNum);
                    if (idx != -1) {
                        e.destinationQueue.splice(idx, 1);
                        e.destinationQueue = [floorNum].concat(e.destinationQueue);
                        e.checkDestinationQueue();  
                    }
                }
            });

            e.on("stopped_at_floor", function(floorNum) {
                var idx = e.destinationQueue.indexOf(floorNum);
                if (e.destinationQueue.indexOf(floorNum) > -1) {
                    e.destinationQueue.splice(idx, 1);
                    update_queue(e);
                }
            });
        }

        for (var i_f=0; i_f<floors.length; i_f++) {
            var f = floors[i_f];
            f.on("up_button_pressed", function() {
                add_destination(get_elevator(), this.floorNum());

            });
            f.on("down_button_pressed", function() {
                add_destination(get_elevator(), this.floorNum());
            });            
        }
    },
    update: function(dt, elevators, floors) {
    }   
}