angular
  .module("plComponents")
  .component("plFooter", {
    controller: [
      function() {
        this
          .moment = moment
        ;
      }
    ],
    controllerAs: "componentController",
    template: [
      "<div layout='row' class='pageElements_divider_row'></div>",
      "<div layout='row' class='pageElements_spacer_row' style='min-height: 10px;'></div>",
      "<div layout='row'>",
      "  <div layout='column' class='pageElements_spacer_column' style='min-width: 10px;'></div>",
      "  <div layout='column'>",
      "    <span class='md-caption font-realtime font-weight-700'>",
      "      &copy; PLAUSIBLE Inc. <span ng-bind='componentController.moment().format(\"YYYY\")'></span>",
      "    </span>",
      "  </div>",
      "  <div layout='column' flex></div>",
      "  <div layout='column'>",
      "    <a class='underline right-to-left md-caption text-align-right font-realtime font-weight-700' ng-href='/legal/terms-of-service/'>",
      "      TERMS of SERVICE",
      "    </a>",
      "  </div>",
      "  <div layout='column' class='pageElements_spacer_column' style='min-width: 10px;'></div>",
      "  <div layout='column'>",
      "    <a class='underline right-to-left md-caption text-align-right font-realtime font-weight-700' ng-href='/settings/'>",
      "      SETTINGS",
      "    </a>",
      "  </div>",
      "  <div layout='column' class='pageElements_spacer_column' style='min-width: 10px;'></div>",
      "</div>",
      "<div layout='row' class='pageElements_spacer_row' style='min-height: 10px;'></div>"
    ].join(" ").replace("  ", "")
  })
;
