module.exports = {
  apps : [{
    name   : "Math",
    script : "./JS/app.js",
    "watch"       : true,
    env_production: {
       NODE_ENV: "production"
    },
    env_development: {
       NODE_ENV: "development"
    }
  }]
}

