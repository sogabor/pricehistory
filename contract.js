"use strict";

var GoodsContent = function (text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key =  obj.key;
		this.goodsname = obj.goodsname;
		this.platfrom = obj.platfrom;
		this.price = obj.price;
	}else{
		this.key =  "";
		this.goodsname = "";
		this.platfrom = "";
		this.price = "";
	}
};

GoodsContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var PriceContract = function () {
	LocalContractStorage.defineMapProperty(this,"price",{
		parse: function(text){
			return new GoodsContent(text);
		},
		stringify: function(o){
			return o.toString();
		}
	});
   
};

PriceContract.prototype = {
    init: function () {

    },
    
    newgoods: function (key,goodsname,platfrom,price) {
		

		if(key ===""){
			throw new Error("not select!!");
		}

		var myprice = this.price.get(key);

        if (myprice){
			myprice.goodsname = goodsname;
			myprice.platfrom = platfrom;
			myprice.price = price;
        }else{
			myprice = new GoodsContent();
			myprice.key = key;
			myprice.goodsname = goodsname;
			myprice.platfrom = platfrom;
			myprice.price = price;
		}
        this.price.put(key, myprice);
    },
	
	updateprice: function (key,price) {
		if(key ===""){
			throw new Error("not select!!");
		}
		var myprice = this.price.get(key);

        if (myprice){
			myprice.price = myprice.price+ '|'+ price;
			this.price.put(key, myprice);
        }else{
			throw new Error("have no this goods");
		}
        
    },

    getgood: function (key) {
		
		key = key.trim();
		
		if(key ===""){
			throw new Error("not select!!");
		}
		var myprice = this.price.get(key);

        if (myprice){
			return myprice;
        }
		return "";
    },


};

module.exports = PriceContract;