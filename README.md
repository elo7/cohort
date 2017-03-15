# Kibana Cohort analysis chart plugin

![Chart screenshot](/images/chart.png?raw=true)

![Chart Table screenshot](/images/chart-table.png?raw=true)

## description

From [Wikipedia](https://en.wikipedia.org/wiki/Cohort_analysis):
> Cohort analysis is a subset of behavioral analytics that takes the data from a given dataset (e.g. an eCommerce platform, web application, or online game) and rather than looking at all users as one unit, it breaks them into related groups for analysis. These related groups, or cohorts, usually share common characteristics or experiences within a defined time-span. Cohort analysis allows a company to “see patterns clearly across the life-cycle of a customer (or user), rather than slicing across all customers blindly without accounting for the natural cycle that a customer undergoes.

## usage

 - The **total** metric is the value that determine y-axis. Can be either a count or a sum. It also possible to use the percentual as y value just marking the option `Show percetual values`.
 - The **cohort date** bucket is the date used to draw the chart lines. Each bucket is a line in this chart. It should be a date histogram.
 - The **cohort period** bucket is the "cohort" itself that determine the x-axis. It should be a numeric histogram.

## install

```
bin/kibana-plugin install https://github.com/elo7/cohort/releases/download/5.1.1/cohort-5.1.1.zip
```

## uninstall

```
bin/kibana-plugin remove cohort
```

## development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. Once you have completed that, use the following npm tasks.

  - `npm start`

    Start kibana and have it include this plugin

  - `npm start -- --config kibana.yml`

    You can pass any argument that you would normally send to `bin/kibana` by putting them after `--` when running `npm start`

  - `npm run test:browser`

    Run the browser tests in a real web browser

  - `npm run test:server`

    Run the server tests using mocha

For more information about any of these commands run `npm run ${task} -- --help`.

## manual distribution

Remember that the plugin version in `package.json` must match Kibana version.

```
export $VERSION=<kibana_version>
export $GITHUB_TOKEN=<token>

npm install

node_modules/release-it/bin/release.js $VERSION  -e
node_modules/publish-release/bin/publish-release --token $GITHUB_TOKEN --owner elo7 --repo cohort --assets build/cohort-$VERSION.zip --tag $VERSION --name $VERSION --notes 'Release for Kibana '$VERSION'
```
