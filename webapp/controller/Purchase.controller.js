sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "../model/formatter"
], function (
    Controller,
    JSONModel,
    MessageBox,
    formatter
) {
    "use strict";

    return Controller.extend(
        "purchasemanagement.controller.Purchase",
        {

            formatter: formatter,


            onInit: function () {

                var oDashboardModel =
                    new JSONModel({
                        totalPOs: 0,
                        pendingPOs: 0,
                        approvedPOs: 0,
                        rejectedPOs: 0,
                        deliveredPOs: 0,
                        totalValue: "0.00"
                    });

                this.getView().setModel(
                    oDashboardModel,
                    "dashboard"
                );

                this._loadDashboard();

                var oChart = this.byId('idVizFrame');
                console.log(this.getOwnerComponent().getModel("purchase"));
                oChart.setVizProperties({

                    plotArea : {
                        dataLabel : {
                            visible : true,
                            type : "value"
                        }
                    },

                    title : {
                        visible : true,
                        text: "Region Vs Purchase Value"
                    },

                    // valueAxis : {
                    //     visible : true,
                    //     text : "Employee Salary"
                    // },
                    // categoryAxis : {
                    //     visible : true,
                    //     text : "Employee"
                    // }
        
                })

            },


            _loadDashboard: async function () {

                try {

                    var oPurchaseModel =
                        this.getOwnerComponent()
                            .getModel("purchase");

                    var oBinding =
                        oPurchaseModel.bindList(
                            "/PurchaseOrders"
                        );

                    var aContexts =
                        await oBinding.requestContexts(
                            0,
                            1000
                        );

                    var aPurchaseOrders =
                        aContexts.map(function (
                            oContext
                        ) {
                            return oContext.getObject();
                        });


                    var iTotal =
                        aPurchaseOrders.length;


                    var iPending =
                        aPurchaseOrders.filter(
                            function (oPO) {

                                return (
                                    oPO.status === "PENDING" ||
                                    oPO.status === "SUBMITTED"
                                );
                            }
                        ).length;


                    var iApproved =
                        aPurchaseOrders.filter(
                            function (oPO) {

                                return oPO.status === "APPROVED";
                            }
                        ).length;


                    var iRejected =
                        aPurchaseOrders.filter(
                            function (oPO) {

                                return oPO.status === "REJECTED" ||
                                       oPO.status === "REJECT";
                            }
                        ).length;


                    var iDelivered =
                        aPurchaseOrders.filter(
                            function (oPO) {

                                return oPO.status === "DELIVERED";
                            }
                        ).length;


                    var nTotalValue =
                        aPurchaseOrders.reduce(
                            function (
                                nTotal,
                                oPO
                            ) {

                                return nTotal +
                                    Number(
                                        oPO.totalAmount || 0
                                    );
                            },
                            0
                        );


                    this.getView()
                        .getModel("dashboard")
                        .setData({

                            totalPOs: iTotal,

                            pendingPOs: iPending,

                            approvedPOs: iApproved,

                            rejectedPOs: iRejected,

                            deliveredPOs: iDelivered,

                            totalValue:
                                nTotalValue.toFixed(2)
                        });


                } catch (oError) {

                    console.error(
                        "Dashboard loading failed:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to load dashboard data."
                    );
                }
            },


            onPurchaseOrders: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("PurchaseOrders");
            },


            onCreatePO: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("CreatePurchaseOrder");
            },


            onProducts: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Products");
            },


            onPriceMaster: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("PriceMaster");
            },


            onAnalytics: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Analytics");
            },


            onPOPress: function (oEvent) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext("purchase");

                if (!oContext) {
                    return;
                }

                var oPO =
                    oContext.getObject();

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "PODetail",
                        {
                            ID: encodeURIComponent(
                                oPO.ID
                            )
                        }
                    );
            }

        }
    );
});