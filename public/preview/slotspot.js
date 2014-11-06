var slot_to_pos = function(slot){
    var p = INFO.Slot(slot);
    return new Vector(p.x, p.y);
};

var spot_to_pos = function(spot){
    var p = INFO.Spot(spot);
    return new Vector(p.x, p.y);
};

var slotspot_to_pos = function(slotspot){
    // very naive?
    var pos = new Vector(0, 0);
    if (slotspot.slot){
        pos = pos.add(slot_to_pos(slotspot.slot));
    }
    if (slotspot.spot){
        pos = pos.add(spot_to_pos(slotspot.spot));
    }
    pos.x += (slotspot.x || 0);
    return pos;
}
