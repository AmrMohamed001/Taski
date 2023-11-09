class features {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    let queryCopy = { ...this.queryString };
    const execlude = ['sort', 'page', 'limit', 'fields'];
    execlude.forEach((ele) => {
      delete queryCopy[ele];
    });
    let advancedQuery = JSON.stringify(queryCopy);
    advancedQuery.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(advancedQuery));
    return this;
  }
  sorting() {
    if (this.queryString.sort) {
      const sorting = this.queryString.sort.split(',').join(' ');
      this.query.sort(sorting);
    } else this.query.sort('name');
    return this;
  }
  projection() {
    if (this.queryString.fields) {
      const proj = this.queryString.fields.split(',').join(' ');
      this.query.select(proj);
    } else this.query.select('-__v');
    return this;
  }
  pagination() {
    if (this.queryString.page) {
      const page = this.queryString.page * 1;
      const limit = this.queryString.limit * 1 || 10;
      const skipLimit = (page - 1) * limit;
      this.query.skip(skipLimit).limit(limit);
    }
    //this.query.limit(10);
    return this;
  }
}
module.exports = features;
