sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/formatter"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    formatter
) {

    "use strict";

    return Controller.extend(
        "purchasemanagement.controller.PurchaseOrders",
        {

            formatter: formatter,


            // =====================================================
            // INIT
            // =====================================================

            onInit: function () {

                var oModel =
                    this.getOwnerComponent()
                        .getModel("purchase");

                if (!oModel) {

                    oModel =
                        this.getOwnerComponent()
                            .getModel();

                    if (oModel) {
                        this.getView().setModel(
                            oModel,
                            "purchase"
                        );
                    }
                }

            },


            // =====================================================
            // TABLE
            // =====================================================

            _getTable: function () {

                return this.byId(
                    "purchaseOrders_table"
                );

            },


            _getTableBinding: function () {

                var oTable = this._getTable();

                if (!oTable) {
                    return null;
                }

                return oTable.getBinding("items");

            },


            onTableUpdateFinished: function () {

                this._updatePOCount();
                this._updateActionButtons();

            },


            _updatePOCount: function () {

                var oTable =
                    this._getTable();

                var oCountText =
                    this.byId(
                        "purchaseOrders_countText"
                    );

                if (!oTable || !oCountText) {
                    return;
                }

                var aItems =
                    oTable.getItems() || [];

                oCountText.setText(
                    "Purchase Orders: " +
                    aItems.length
                );

            },


            // =====================================================
            // SEARCH
            // =====================================================

            onSearch: function (oEvent) {

                var sQuery =
                    oEvent.getParameter("query") || "";

                this._applyFilters(sQuery);

            },


            _applyFilters: function (sQuery) {

                var oBinding =
                    this._getTableBinding();

                if (!oBinding) {
                    return;
                }

                var aFilters = [];


                if (sQuery) {

                    aFilters.push(
                        new Filter({
                            filters: [

                                new Filter(
                                    "poNumber",
                                    FilterOperator.Contains,
                                    sQuery
                                ),

                                new Filter(
                                    "status",
                                    FilterOperator.Contains,
                                    sQuery
                                )

                            ],
                            and: false
                        })
                    );

                }


                var oStatusSelect =
                    this.byId(
                        "purchaseOrders_statusSelect"
                    );

                if (oStatusSelect) {

                    var sStatus =
                        oStatusSelect.getSelectedKey();

                    if (
                        sStatus &&
                        sStatus !== "ALL"
                    ) {

                        aFilters.push(
                            new Filter(
                                "status",
                                FilterOperator.EQ,
                                sStatus
                            )
                        );

                    }

                }


                oBinding.filter(aFilters);

            },


            // =====================================================
            // STATUS FILTER
            // =====================================================

            onStatusChange: function () {

                var oSearch =
                    this.byId(
                        "purchaseOrders_searchField"
                    );

                var sQuery =
                    oSearch
                        ? oSearch.getValue()
                        : "";

                this._applyFilters(sQuery);

            },


            // =====================================================
            // SELECTION
            // =====================================================

            onSelectionChange: function () {

                this._updateActionButtons();

            },


            _getSelectedItems: function () {

                var oTable =
                    this._getTable();

                if (!oTable) {
                    return [];
                }

                return oTable.getSelectedItems();

            },


            _getSelectedContexts: function () {

                return this
                    ._getSelectedItems()
                    .map(function (oItem) {

                        return oItem
                            .getBindingContext("purchase");

                    })
                    .filter(Boolean);

            },


            _updateActionButtons: function () {

                var oEditButton =
                    this.byId(
                        "purchaseOrders_editActionButton"
                    );

                var oSubmitButton =
                    this.byId(
                        "purchaseOrders_submitActionButton"
                    );

                var oDeleteButton =
                    this.byId(
                        "purchaseOrders_deleteActionButton"
                    );


                if (
                    !oEditButton ||
                    !oSubmitButton ||
                    !oDeleteButton
                ) {
                    return;
                }


                var aContexts =
                    this._getSelectedContexts();


                if (aContexts.length === 0) {

                    oEditButton.setEnabled(false);
                    oSubmitButton.setEnabled(false);
                    oDeleteButton.setEnabled(false);

                    return;

                }


                var aPOs =
                    aContexts.map(function (oContext) {

                        return oContext.getObject();

                    });


                var bAllPending =
                    aPOs.every(function (oPO) {

                        return oPO.status === "PENDING";

                    });


                // Edit = exactly one PENDING PO
                oEditButton.setEnabled(
                    aPOs.length === 1 &&
                    bAllPending
                );


                // Submit = one or more PENDING
                oSubmitButton.setEnabled(
                    aPOs.length > 0 &&
                    bAllPending
                );


                // Delete = one or more PENDING
                oDeleteButton.setEnabled(
                    aPOs.length > 0 &&
                    bAllPending
                );

            },


            // =====================================================
            // EDIT
            // =====================================================

            onEditPO: function () {

                var aContexts =
                    this._getSelectedContexts();


                if (aContexts.length !== 1) {

                    MessageToast.show(
                        "Please select one Purchase Order."
                    );

                    return;

                }


                var oPO =
                    aContexts[0].getObject();


                if (!oPO) {
                    return;
                }


                if (oPO.status !== "PENDING") {

                    MessageBox.warning(
                        "Only PENDING Purchase Orders can be edited."
                    );

                    return;

                }


                this
                    .getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "EditPurchaseOrder",
                        {
                            ID: oPO.ID
                        }
                    );

            },


            // =====================================================
            // SUBMIT
            // =====================================================

            onSubmitPO: function () {

                var aContexts =
                    this._getSelectedContexts();

                if (aContexts.length === 0) {

                    MessageToast.show(
                        "Please select Purchase Order(s)."
                    );

                    return;

                }


                var oModel =
                    this.getOwnerComponent()
                        .getModel("purchase");


                if (!oModel) {
                    oModel =
                        this.getOwnerComponent()
                            .getModel();
                }


                var that = this;


                MessageBox.confirm(
                    "Submit " +
                    aContexts.length +
                    " Purchase Order(s)?",
                    {

                        title: "Confirm Submission",

                        onClose: async function (sAction) {

                            if (
                                sAction !==
                                MessageBox.Action.OK
                            ) {
                                return;
                            }


                            try {

                                sap.ui.core.BusyIndicator.show(0);


                                for (
                                    var i = 0;
                                    i < aContexts.length;
                                    i++
                                ) {

                                    var oAction =
                                        oModel.bindContext(
                                            "PurchaseOrderService.submitPO(...)",
                                            aContexts[i]
                                        );

                                    await oAction.execute();

                                }


                                MessageToast.show(
                                    "Purchase Order(s) submitted successfully."
                                );


                                that._clearSelection();
                                that.onRefresh();


                            } catch (oError) {

                                MessageBox.error(
                                    that._getErrorMessage(
                                        oError
                                    )
                                );

                            } finally {

                                sap.ui.core.BusyIndicator.hide();

                            }

                        }

                    }
                );

            },


            // =====================================================
            // DELETE
            // =====================================================

            onDeletePO: function () {

                var aContexts =
                    this._getSelectedContexts();

                if (aContexts.length === 0) {

                    MessageToast.show(
                        "Please select Purchase Order(s)."
                    );

                    return;

                }


                var that = this;


                MessageBox.confirm(
                    "Delete " +
                    aContexts.length +
                    " Purchase Order(s)?",
                    {

                        title: "Confirm Delete",

                        onClose: async function (sAction) {

                            if (
                                sAction !==
                                MessageBox.Action.OK
                            ) {
                                return;
                            }


                            try {

                                sap.ui.core.BusyIndicator.show(0);


                                for (
                                    var i = 0;
                                    i < aContexts.length;
                                    i++
                                ) {

                                    await aContexts[i].delete();

                                }


                                MessageToast.show(
                                    "Purchase Order(s) deleted successfully."
                                );


                                that._clearSelection();
                                that.onRefresh();


                            } catch (oError) {

                                MessageBox.error(
                                    that._getErrorMessage(
                                        oError
                                    )
                                );

                            } finally {

                                sap.ui.core.BusyIndicator.hide();

                            }

                        }

                    }
                );

            },


            // =====================================================
            // DETAILS
            // =====================================================

            onPOPress: function (oEvent) {

                var oContext =
                    oEvent
                        .getSource()
                        .getBindingContext("purchase");


                if (!oContext) {
                    return;
                }


                var oPO =
                    oContext.getObject();


                this
                    .getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "PurchaseOrderDetails",
                        {
                            ID: oPO.ID
                        }
                    );

            },


            // =====================================================
            // REFRESH
            // =====================================================

            onRefresh: function () {

                var oBinding =
                    this._getTableBinding();

                if (oBinding) {
                    oBinding.refresh();
                }

            },


            _clearSelection: function () {

                var oTable =
                    this._getTable();

                if (oTable) {
                    oTable.removeSelections(true);
                }

                this._updateActionButtons();

            },


            // =====================================================
            // CREATE
            // =====================================================

            onCreatePO: function () {

                this
                    .getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "CreatePurchaseOrder"
                    );

            },


            // =====================================================
            // BACK
            // =====================================================

            onBack: function () {

                window.history.back();

            },


            // =====================================================
            // ERROR
            // =====================================================

            _getErrorMessage: function (oError) {

                if (!oError) {
                    return "Unknown error occurred.";
                }

                if (oError.message) {
                    return oError.message;
                }

                return "An error occurred.";

            }

        }
    );

});