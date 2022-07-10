module.exports = {
    setUpLabels: (reqQuery) => {
        switch (reqQuery) {
            case 'brand': {
                return {label1: 'Name', label2: 'Description'}
            }
            case 'size': {
                return {label1: 'Size US/UK', label2: 'Size Vietnam'}
            }
        }
    },
    filterCategory: (arrayCategory) => {
        const listBrand = arrayCategory.filter(brand => brand.type==='brand');
        const listSize = arrayCategory.filter(size => size.type==='size');
        const listStyle = arrayCategory.filter(style => style.type==='style');
        return {listBrand, listSize, listStyle};
    },
    sortSize: (listSize) => {
        var result = [];
        for(var i = 0; i < listSize.length; i++) {
            result.push(listSize[i].name);
        }
        return result.sort();
    }
}