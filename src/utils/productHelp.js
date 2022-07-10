module.exports = {
    // set amount for order
    setAmountForSize: (size, amountOfSize) => {
        var result = [], i = 0;
        while(size[i] != undefined) {
            if(amountOfSize[i]==='') {
                result.push(`${size[i]}:0`);
                i++;
                continue;
            }
            result.push({
                'size': size[i],
                'amount': amountOfSize[i]
            });
            i++;
        }
        return result;
    },
    setAmount: (amountOfSize) => {
        var amount = 0;
        amountOfSize = amountOfSize.map(Number);
        for(var i = 0; i < amountOfSize.length; i++) {
            amount += amountOfSize[i];
        }
        return amount;
    },

    // set condition for search or filter product
    setCondition: (condition, action) => {
        if(action === 'search') {
            let object = {};
            object.name = new RegExp(condition.search, 'i');
            return object;
        }
        else {
            if(condition.brand != '') {
                return {brand :condition.brand};
            }
            else if(condition. style != '') {   
                return {style :condition.style};
            }
            else {
                return {
                    brand: condition.brand,
                    style: condition.style
                };
            }
        }
    }
}