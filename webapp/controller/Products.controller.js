sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    Controller,
    Fragment,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast
) {

    "use strict";

    return Controller.extend(
        "purchasemanagement.controller.Products",
        {

            _oCreateDialog: null,
            _oEditDialog: null,
            _oEditContext: null,

            // =========================================================
            // INIT
            // =========================================================

            onInit: function () {

                var oTable = this.byId("productsTable");

                if (oTable) {
                    oTable.attachUpdateFinished(
                        this._onProductsUpdateFinished,
                        this
                    );
                }

            },


            // =========================================================
            // NAV BACK
            // =========================================================

            onNavBack: function () {

                window.history.back();

            },


            // =========================================================
            // REFRESH
            // =========================================================

            onRefresh: function () {

                var oTable = this.byId("productsTable");

                if (!oTable) {
                    return;
                }

                var oBinding = oTable.getBinding("items");

                if (oBinding) {

                    oBinding.refresh();

                    MessageToast.show(
                        "Products refreshed"
                    );

                }

            },


            // =========================================================
            // SEARCH
            // IMPORTANT: VIEW USES onSearch
            // =========================================================

            onSearch: function (oEvent) {

                var sValue =
                    oEvent.getParameter("newValue") || "";

                sValue = sValue.trim();

                var oTable =
                    this.byId("productsTable");

                if (!oTable) {
                    return;
                }

                var oBinding =
                    oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                var aFilters = [];

                // Only active products
                aFilters.push(
                    new Filter(
                        "active",
                        FilterOperator.EQ,
                        true
                    )
                );

                if (sValue) {

                    var oNameFilter =
                        new Filter(
                            "productName",
                            FilterOperator.Contains,
                            sValue
                        );

                    var oCodeFilter =
                        new Filter(
                            "productCode",
                            FilterOperator.Contains,
                            sValue
                        );

                    var oSearchFilter =
                        new Filter({
                            filters: [
                                oNameFilter,
                                oCodeFilter
                            ],
                            and: false
                        });

                    aFilters.push(
                        oSearchFilter
                    );

                }

                oBinding.filter(aFilters);

                this._updateProductCount();

            },


            // =========================================================
            // CATEGORY CHANGE
            // IMPORTANT: VIEW USES onCategoryChange
            // =========================================================

            onCategoryChange: function (oEvent) {

                var sCategoryId =
                    oEvent.getParameter("selectedKey");

                var oTable =
                    this.byId("productsTable");

                if (!oTable) {
                    return;
                }

                var oBinding =
                    oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                var aFilters = [];

                // Only active products
                aFilters.push(
                    new Filter(
                        "active",
                        FilterOperator.EQ,
                        true
                    )
                );

                if (sCategoryId) {

                    aFilters.push(
                        new Filter(
                            "category_ID",
                            FilterOperator.EQ,
                            sCategoryId
                        )
                    );

                }

                oBinding.filter(aFilters);

                this._updateProductCount();

            },


            // =========================================================
            // SELECTION CHANGE
            // IMPORTANT: VIEW USES onSelectionChange
            // =========================================================

            onSelectionChange: function (oEvent) {

                var bSelected =
                    oEvent.getParameter("selected");

                var oViewButton =
                    this.byId("productsViewButton");

                var oEditButton =
                    this.byId("productsEditButton");

                var oDeleteButton =
                    this.byId("productsDeleteButton");

                if (oViewButton) {
                    oViewButton.setEnabled(
                        bSelected
                    );
                }

                if (oEditButton) {
                    oEditButton.setEnabled(
                        bSelected
                    );
                }

                if (oDeleteButton) {
                    oDeleteButton.setEnabled(
                        bSelected
                    );
                }

            },


            // =========================================================
            // PRODUCT COUNT
            // =========================================================

            _updateProductCount: function () {

                var oTable =
                    this.byId("productsTable");

                var oCountText =
                    this.byId("productsCountText");

                if (!oTable || !oCountText) {
                    return;
                }

                var oBinding =
                    oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                var iLength =
                    oBinding.getLength();

                if (iLength >= 0) {

                    oCountText.setText(
                        "Products: " + iLength
                    );

                }

            },


            // =========================================================
            // TABLE UPDATE
            // CALCULATE STOCK
            // =========================================================

            _onProductsUpdateFinished: async function () {

                var oTable =
                    this.byId("productsTable");

                if (!oTable) {
                    return;
                }

                var aItems =
                    oTable.getItems();

                for (
                    var i = 0;
                    i < aItems.length;
                    i++
                ) {

                    var oItem =
                        aItems[i];

                    var oContext =
                        oItem.getBindingContext(
                            "purchase"
                        );

                    if (!oContext) {
                        continue;
                    }

                    try {

                        var oProduct =
                            await oContext.requestObject();

                        var iTotalStock = 0;

                        if (
                            oProduct &&
                            Array.isArray(
                                oProduct.inventory
                            )
                        ) {

                            oProduct.inventory.forEach(
                                function (oInventory) {

                                    iTotalStock +=
                                        Number(
                                            oInventory.availableQuantity
                                        ) || 0;

                                }
                            );

                        }

                        /*
                         * Table columns:
                         *
                         * 0 Product Code
                         * 1 Product Name
                         * 2 Category
                         * 3 Unit Price
                         * 4 Stock Qty
                         * 5 Status
                         */

                        var aCells =
                            oItem.getCells();

                        if (aCells.length > 4) {

                            var oStockCell =
                                aCells[4];

                            /*
                             * Stock cell is ObjectNumber,
                             * therefore use setNumber()
                             */

                            if (
                                oStockCell &&
                                typeof oStockCell.setNumber ===
                                "function"
                            ) {

                                oStockCell.setNumber(
                                    String(iTotalStock)
                                );

                            }

                        }

                    } catch (oError) {

                        console.error(
                            "Stock calculation error:",
                            oError
                        );

                    }

                }

                this._updateProductCount();

            },


            // =========================================================
            // CREATE PRODUCT
            // =========================================================

            onCreateProduct: async function () {

                try {

                    if (!this._oCreateDialog) {

                        this._oCreateDialog =
                            await Fragment.load({

                                id:
                                    this.getView().getId(),

                                name:
                                    "purchasemanagement.fragment.CreateProduct",

                                controller:
                                    this

                            });

                        this.getView().addDependent(
                            this._oCreateDialog
                        );

                    }

                    var sViewId =
                        this.getView().getId();

                    // IMPORTANT:
                    // IDs exactly match CreateProduct.fragment.xml

                    var oNameInput =
                        Fragment.byId(
                            sViewId,
                            "cpInpName001"
                        );

                    var oCategorySelect =
                        Fragment.byId(
                            sViewId,
                            "cpSelCat001"
                        );

                    var oPriceInput =
                        Fragment.byId(
                            sViewId,
                            "cpInpPrice001"
                        );

                    if (oNameInput) {
                        oNameInput.setValue("");
                    }

                    if (oCategorySelect) {
                        oCategorySelect.setSelectedKey("");
                    }

                    if (oPriceInput) {
                        oPriceInput.setValue("");
                    }

                    this._oCreateDialog.open();

                } catch (oError) {

                    console.error(
                        "Create Product Dialog Error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to open Create Product dialog.\n\n" +
                        oError.message
                    );

                }

            },


            // =========================================================
            // CREATE PRODUCT - SAVE
            // =========================================================

            onCreateProductConfirm: async function () {

                var sViewId =
                    this.getView().getId();

                var oNameInput =
                    Fragment.byId(
                        sViewId,
                        "cpInpName001"
                    );

                var oCategorySelect =
                    Fragment.byId(
                        sViewId,
                        "cpSelCat001"
                    );

                var oPriceInput =
                    Fragment.byId(
                        sViewId,
                        "cpInpPrice001"
                    );

                if (
                    !oNameInput ||
                    !oCategorySelect ||
                    !oPriceInput
                ) {

                    MessageBox.error(
                        "Create Product controls could not be found."
                    );

                    return;

                }

                var sProductName =
                    oNameInput
                        .getValue()
                        .trim();

                var sCategoryId =
                    oCategorySelect
                        .getSelectedKey();

                var sPrice =
                    oPriceInput
                        .getValue()
                        .trim();


                // -----------------------------------------------------
                // VALIDATION
                // -----------------------------------------------------

                if (!sProductName) {

                    MessageBox.warning(
                        "Product Name is mandatory."
                    );

                    return;

                }

                if (!sCategoryId) {

                    MessageBox.warning(
                        "Please select a Category."
                    );

                    return;

                }

                if (
                    !sPrice ||
                    isNaN(Number(sPrice)) ||
                    Number(sPrice) < 0
                ) {

                    MessageBox.warning(
                        "Please enter a valid Unit Price."
                    );

                    return;

                }


                try {

                    var oModel =
                        this.getView()
                            .getModel("purchase");

                    if (!oModel) {

                        MessageBox.error(
                            "Purchase model is not available."
                        );

                        return;

                    }


                    // -------------------------------------------------
                    // CREATE
                    // Product Code is generated by backend
                    // -------------------------------------------------

                    var oListBinding =
                        oModel.bindList(
                            "/Products"
                        );

                    var oContext =
                        oListBinding.create({

                            productName:
                                sProductName,

                            category_ID:
                                sCategoryId,

                            unitPrice:
                                Number(sPrice),

                            active:
                                true

                        });

                    await oContext.created();


                    MessageToast.show(
                        "Product created successfully."
                    );


                    this._oCreateDialog.close();


                    // Refresh table

                    var oTable =
                        this.byId("productsTable");

                    if (oTable) {

                        var oBinding =
                            oTable.getBinding("items");

                        if (oBinding) {
                            oBinding.refresh();
                        }

                    }

                } catch (oError) {

                    console.error(
                        "Create Product Error:",
                        oError
                    );

                    MessageBox.error(
                        this._getErrorMessage(
                            oError,
                            "Failed to create product."
                        )
                    );

                }

            },


            // =========================================================
            // CREATE CANCEL
            // =========================================================

            onCreateProductCancel: function () {

                if (this._oCreateDialog) {
                    this._oCreateDialog.close();
                }

            },


            // =========================================================
            // VIEW PRODUCT
            // =========================================================

            onViewProduct: async function () {

                var oTable =
                    this.byId("productsTable");

                if (!oTable) {
                    return;
                }

                var oSelectedItem =
                    oTable.getSelectedItem();

                if (!oSelectedItem) {

                    MessageBox.warning(
                        "Please select a product."
                    );

                    return;

                }

                try {

                    var oContext =
                        oSelectedItem
                            .getBindingContext(
                                "purchase"
                            );

                    if (!oContext) {

                        MessageBox.error(
                            "Unable to get product information."
                        );

                        return;

                    }

                    var oProduct =
                        await oContext.requestObject();


                    // -------------------------------------------------
                    // STOCK
                    // -------------------------------------------------

                    var iTotalStock = 0;

                    if (
                        oProduct.inventory &&
                        Array.isArray(
                            oProduct.inventory
                        )
                    ) {

                        oProduct.inventory.forEach(
                            function (oInventory) {

                                iTotalStock +=
                                    Number(
                                        oInventory.availableQuantity
                                    ) || 0;

                            }
                        );

                    }


                    // -------------------------------------------------
                    // CATEGORY
                    // -------------------------------------------------

                    var sCategory = "-";

                    if (
                        oProduct.category &&
                        oProduct.category.categoryName
                    ) {

                        sCategory =
                            oProduct.category.categoryName;

                    }


                    // -------------------------------------------------
                    // PRICE
                    // -------------------------------------------------

                    var sPrice = "0";

                    if (
                        oProduct.unitPrice !== null &&
                        oProduct.unitPrice !== undefined
                    ) {

                        sPrice =
                            Number(
                                oProduct.unitPrice
                            ).toLocaleString(
                                "en-IN"
                            );

                    }


                    // -------------------------------------------------
                    // DETAILS
                    // -------------------------------------------------

                    MessageBox.information(

                        "Product Code: " +
                        (
                            oProduct.productCode ||
                            "-"
                        ) +

                        "\n\nProduct Name: " +
                        (
                            oProduct.productName ||
                            "-"
                        ) +

                        "\n\nCategory: " +
                        sCategory +

                        "\n\nUnit Price: ₹" +
                        sPrice +

                        "\n\nStock Quantity: " +
                        iTotalStock +

                        "\n\nStatus: " +
                        (
                            oProduct.active
                                ? "ACTIVE"
                                : "INACTIVE"
                        ),

                        {
                            title:
                                "Product Details"
                        }

                    );

                } catch (oError) {

                    console.error(
                        "View Product Error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to load product details."
                    );

                }

            },


            // =========================================================
            // EDIT PRODUCT
            // =========================================================

            onEditProduct: async function () {

                var oTable =
                    this.byId("productsTable");

                if (!oTable) {
                    return;
                }

                var oSelectedItem =
                    oTable.getSelectedItem();

                if (!oSelectedItem) {

                    MessageBox.warning(
                        "Please select a product."
                    );

                    return;

                }

                try {

                    var oContext =
                        oSelectedItem
                            .getBindingContext(
                                "purchase"
                            );

                    if (!oContext) {

                        MessageBox.error(
                            "Unable to get product information."
                        );

                        return;

                    }


                    // -------------------------------------------------
                    // LOAD EDIT FRAGMENT
                    // -------------------------------------------------

                    if (!this._oEditDialog) {

                        this._oEditDialog =
                            await Fragment.load({

                                id:
                                    this.getView().getId(),

                                name:
                                    "purchasemanagement.fragment.EditProduct",

                                controller:
                                    this

                            });

                        this.getView().addDependent(
                            this._oEditDialog
                        );

                    }


                    this._oEditContext =
                        oContext;


                    var oProduct =
                        await oContext.requestObject();


                    var sViewId =
                        this.getView().getId();


                    // -------------------------------------------------
                    // SET EDIT VALUES
                    // IDs exactly match fragment
                    // -------------------------------------------------

                    var oCodeInput =
                        Fragment.byId(
                            sViewId,
                            "epInpCode001"
                        );

                    var oNameInput =
                        Fragment.byId(
                            sViewId,
                            "epInpName001"
                        );

                    var oCategorySelect =
                        Fragment.byId(
                            sViewId,
                            "epSelCat001"
                        );

                    var oPriceInput =
                        Fragment.byId(
                            sViewId,
                            "epInpPrice001"
                        );


                    if (oCodeInput) {

                        oCodeInput.setValue(
                            oProduct.productCode || ""
                        );

                    }


                    if (oNameInput) {

                        oNameInput.setValue(
                            oProduct.productName || ""
                        );

                    }


                    if (oCategorySelect) {

                        oCategorySelect.setSelectedKey(
                            oProduct.category_ID || ""
                        );

                    }


                    if (oPriceInput) {

                        oPriceInput.setValue(

                            oProduct.unitPrice !== null &&
                            oProduct.unitPrice !== undefined

                                ? String(
                                    oProduct.unitPrice
                                )

                                : ""

                        );

                    }


                    this._oEditDialog.open();

                } catch (oError) {

                    console.error(
                        "Edit Product Dialog Error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to open Edit Product dialog.\n\n" +
                        oError.message
                    );

                }

            },


            // =========================================================
            // EDIT PRODUCT - SAVE
            // =========================================================

            onEditProductConfirm: async function () {

                if (!this._oEditContext) {

                    MessageBox.error(
                        "No product selected."
                    );

                    return;

                }


                var sViewId =
                    this.getView().getId();


                var oNameInput =
                    Fragment.byId(
                        sViewId,
                        "epInpName001"
                    );

                var oCategorySelect =
                    Fragment.byId(
                        sViewId,
                        "epSelCat001"
                    );

                var oPriceInput =
                    Fragment.byId(
                        sViewId,
                        "epInpPrice001"
                    );


                if (
                    !oNameInput ||
                    !oCategorySelect ||
                    !oPriceInput
                ) {

                    MessageBox.error(
                        "Edit Product controls could not be found."
                    );

                    return;

                }


                var sProductName =
                    oNameInput
                        .getValue()
                        .trim();

                var sCategoryId =
                    oCategorySelect
                        .getSelectedKey();

                var sPrice =
                    oPriceInput
                        .getValue()
                        .trim();


                // -----------------------------------------------------
                // VALIDATION
                // -----------------------------------------------------

                if (!sProductName) {

                    MessageBox.warning(
                        "Product Name is mandatory."
                    );

                    return;

                }

                if (!sCategoryId) {

                    MessageBox.warning(
                        "Please select a Category."
                    );

                    return;

                }

                if (
                    !sPrice ||
                    isNaN(Number(sPrice)) ||
                    Number(sPrice) < 0
                ) {

                    MessageBox.warning(
                        "Please enter a valid Unit Price."
                    );

                    return;

                }


                try {

                    // -------------------------------------------------
                    // UPDATE
                    // -------------------------------------------------

                    this._oEditContext.setProperty(
                        "productName",
                        sProductName
                    );

                    this._oEditContext.setProperty(
                        "category_ID",
                        sCategoryId
                    );

                    this._oEditContext.setProperty(
                        "unitPrice",
                        Number(sPrice)
                    );


                    var oModel =
                        this.getView()
                            .getModel("purchase");


                    await oModel.submitBatch(
                        "$auto"
                    );


                    MessageToast.show(
                        "Product updated successfully."
                    );


                    this._oEditDialog.close();


                    var oTable =
                        this.byId("productsTable");

                    if (oTable) {

                        var oBinding =
                            oTable.getBinding("items");

                        if (oBinding) {
                            oBinding.refresh();
                        }

                    }


                    this._oEditContext =
                        null;

                } catch (oError) {

                    console.error(
                        "Edit Product Error:",
                        oError
                    );

                    MessageBox.error(
                        this._getErrorMessage(
                            oError,
                            "Failed to update product."
                        )
                    );

                }

            },


            // =========================================================
            // EDIT CANCEL
            // =========================================================

            onEditProductCancel: function () {

                if (this._oEditContext) {

                    try {

                        this._oEditContext.resetChanges();

                    } catch (oError) {

                        console.warn(
                            "Reset changes failed:",
                            oError
                        );

                    }

                }


                if (this._oEditDialog) {
                    this._oEditDialog.close();
                }


                this._oEditContext =
                    null;

            },


            // =========================================================
            // DELETE PRODUCT
            // =========================================================

            onDeleteProduct: function () {

                var oTable =
                    this.byId("productsTable");

                if (!oTable) {
                    return;
                }

                var oSelectedItem =
                    oTable.getSelectedItem();

                if (!oSelectedItem) {

                    MessageBox.warning(
                        "Please select a product."
                    );

                    return;

                }


                var oContext =
                    oSelectedItem
                        .getBindingContext(
                            "purchase"
                        );

                if (!oContext) {

                    MessageBox.error(
                        "Unable to identify selected product."
                    );

                    return;

                }


                var that = this;


                oContext.requestObject()
                    .then(
                        function (oProduct) {

                            MessageBox.confirm(

                                "Are you sure you want to delete \"" +
                                (
                                    oProduct.productName ||
                                    "this product"
                                ) +
                                "\"?",

                                {

                                    title:
                                        "Delete Product",

                                    actions: [
                                        MessageBox.Action.YES,
                                        MessageBox.Action.NO
                                    ],

                                    emphasizedAction:
                                        MessageBox.Action.YES,

                                    onClose:
                                        async function (
                                            sAction
                                        ) {

                                            if (
                                                sAction !==
                                                MessageBox.Action.YES
                                            ) {
                                                return;
                                            }


                                            try {

                                                await oContext.delete();


                                                MessageToast.show(
                                                    "Product deleted successfully."
                                                );


                                                var oBinding =
                                                    oTable.getBinding(
                                                        "items"
                                                    );


                                                if (oBinding) {
                                                    oBinding.refresh();
                                                }


                                            } catch (oError) {

                                                console.error(
                                                    "Delete Product Error:",
                                                    oError
                                                );


                                                MessageBox.error(
                                                    that._getErrorMessage(
                                                        oError,
                                                        "Failed to delete product."
                                                    )
                                                );

                                            }

                                        }

                                }

                            );

                        }
                    )
                    .catch(
                        function (oError) {

                            console.error(
                                "Product Read Error:",
                                oError
                            );

                            MessageBox.error(
                                "Unable to load product information."
                            );

                        }
                    );

            },


            // =========================================================
            // ERROR MESSAGE
            // =========================================================

            _getErrorMessage: function (
                oError,
                sDefaultMessage
            ) {

                if (!oError) {
                    return sDefaultMessage;
                }

                if (
                    oError.message &&
                    oError.message.trim()
                ) {

                    return oError.message;

                }

                if (oError.responseText) {

                    try {

                        var oResponse =
                            JSON.parse(
                                oError.responseText
                            );

                        if (
                            oResponse.error &&
                            oResponse.error.message
                        ) {

                            return oResponse.error.message;

                        }

                    } catch (oParseError) {

                        console.warn(
                            "Unable to parse error response.",
                            oParseError
                        );

                    }

                }

                return sDefaultMessage;

            }

        }
    );

});