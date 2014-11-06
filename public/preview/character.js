/*
Story Characters

relies on paperdoll.js
and INFO being defined

*/


var Character = (function(){
    function Character(id){
        this.info = INFO.Character(id);
        this.name = this.info.displayName;
        this.doll = null;
        var self = this;
        this.movement = new Movement();
        console.log('MOVE YOUR ASS ' + JSON.stringify(this.movement));
        this._last_updated = 0; // hack: the time of the last update
        var bodyAsset = INFO.Body(this.info.bodyType).assetName;
        _fetch_json('/atlas/' + bodyAsset + '.json', function(atlas){
            self.doll = new PaperDoll(atlas);

            if (self.willBehave){
                self.behave(self.willBehave);
            }

            self.refresh();
        });
    };

    Character.prototype.wear_apparel = function(apparel){
        var doll = this.doll;
        _fetch_json('/atlas/' + apparel.assetName + '.json', function(atlas){
            doll.wear(new Collection(atlas));
        });
    };

    Character.prototype.get_naked = function(){
        this.doll.clear_apparel();
        this.wear_apparel(INFO.Hair(this.info.hairType));
        this.wear_apparel(INFO.Face(this.info.faceType));
        this.wear_apparel(INFO.FaceEyes(this.info.faceEyesType));
        this.wear_apparel(INFO.FaceMouth(this.info.faceMouthType));
    };

    Character.prototype.set_movement = function(movement){
        if (movement === undefined){
            console.log('undefined movement? dance thime');
        }
        this.movement = movement;
    };
    Character.prototype.get_position = function(t){
        if (t === undefined){
            // assume now?
            ERROR('no t, assuming now');
            t = NOW();
        }
        return this.movement.eval(t);
    };
    Character.prototype.wear = function(outfitID){
        var outfit = INFO.Outfit(outfitID);
        this.get_naked();
        var clothes = outfit.clothingIdentifiers.split('|');
        for (var i in clothes){
            var clothingID = clothes[i];
            var item = INFO.Clothing(clothingID);
            this.wear_apparel(item);
        }
    };

    Character.prototype.refresh = function(){
        this.wear(this.info.outfit);
    };

    Character.prototype.behave = function(behaviorID){
        if (!behaviorID) {
            return;
        }
        if (!this.doll){
            this.willBehave = behaviorID;
            return;
        }
        this.willBehave = undefined;
        var behavior = INFO.Behavior(behaviorID);
        var tbd_check = function(animID, alternate){
            if (animID == 'tbd') return alternate;
            return animID;
        }
        var animation;
        if (this.info.gender == 'm'){
            animation = INFO.Animation(tbd_check(behavior.maleAnimation, 'm_tbd'));
        } else {
            animation = INFO.Animation(tbd_check(behavior.girlAnimation, 'f_tbd'));
        }
        var doll = this.doll;
        _fetch_json('/dcon/' + animation.filename + '.json', function(anim){
            doll.perform(new Animation(anim));
        });
    };

    Character.prototype.draw = function(ctx){
        if (!this.doll) return;
        // move ctx to character position
        var p = this.get_position(this._last_updated);
        ctx.save();

        // todo: look at the actual numbers from the client
        // instead of trying to guess
        ctx.translate(2 * p.x - 300, 2 * p.y - 500);
        ctx.scale(1.5, 1.5);

        this.doll.draw(ctx);
        ctx.restore();
    };

    Character.prototype.update = function(t){
        if (!this.doll) return;
        this._last_updated = t; // omg hack
        this.doll.update(t);
    };

    var _fetch_json = function(url, callback){
        // should probably use jquery for better support
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function(){
            if (ajax.readyState==4 && ajax.status==200){
                var json = JSON.parse(ajax.responseText);
                callback(json);
            }
        };
        ajax.open("GET", url, true);
        ajax.send();
    };

    return Character;
})();
