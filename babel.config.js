module.exports = function(api) {
  api.cache(true);

  return {
    env: {
      prod: {
        presets: [['@babel/env', { modules: false } ]],
      },
      test: {
        presets: ['@babel/env'],
      }
    }
  };
};
