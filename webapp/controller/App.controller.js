sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (
    Controller,
    MessageToast
) {
    "use strict";

    return Controller.extend(
        "purchasemanagement.controller.App",
        {

            onInit: function () {

                this.oRouter =
                    this.getOwnerComponent()
                        .getRouter();

                this.oSideNavigation =
                    this.byId("sideNavigation");
            },

            onToggleSideNavigation: function () {

                var bExpanded =
                    this.oSideNavigation.getExpanded();

                this.oSideNavigation.setExpanded(
                    !bExpanded
                );
            },

            onNavigationSelect: function (oEvent) {

                var oItem =
                    oEvent.getParameter("item");

                var sKey =
                    oItem.getKey();

                switch (sKey) {

                    case "home":
                        this.oRouter.navTo("Purchase");
                        break;

                    case "allOrders":
                        this.oRouter.navTo("PurchaseOrders");
                        break;

                    case "createOrder":
                        this.oRouter.navTo("CreatePurchaseOrder");
                        break;

                    case "products":
                        this.oRouter.navTo("Products");
                        break;

                    case "priceMaster":
                        this.oRouter.navTo("PriceMaster");
                        break;

                    case "priceHistory":
                        this.oRouter.navTo("PriceHistory");
                        break;

                    case "analytics":
                        this.oRouter.navTo("Analytics");
                        break;

                    default:
                        break;
                }
            },

            onSearch: function () {

                MessageToast.show(
                    "Search functionality"
                );
            },

            onNotifications: function () {

                MessageToast.show(
                    "No new notifications"
                );
            },

            onUserPress: function () {

                MessageToast.show(
                    "User profile"
                );
            }
        }
    );
});