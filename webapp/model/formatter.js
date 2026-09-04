sap.ui.define([], function () {
    "use strict";

    return {

        formatDate: function (vDate) {

            if (!vDate) {
                return "";
            }

            var oDate = new Date(vDate);

            if (isNaN(oDate.getTime())) {
                return "";
            }

            return String(oDate.getDate()).padStart(2, "0") +
                "-" +
                String(oDate.getMonth() + 1).padStart(2, "0") +
                "-" +
                oDate.getFullYear();
        },


        statusState: function (sStatus) {

            switch (sStatus) {

                case "PENDING":
                    return "Warning";

                case "SUBMITTED":
                    return "Information";

                case "APPROVED":
                    return "Success";

                case "DELIVERED":
                    return "Success";

                case "REJECTED":
                    return "Error";

                case "REJECT":
                    return "Error";

                default:
                    return "None";
            }
        },


        priceState: function (sStatus) {

            switch (sStatus) {

                case "ACTIVE":
                    return "Success";

                case "EXPIRED":
                    return "Error";

                default:
                    return "None";
            }
        },


        toDateString: function (vDate) {

            if (!vDate) {
                return null;
            }

            var oDate = new Date(vDate);

            return oDate.getFullYear() +
                "-" +
                String(
                    oDate.getMonth() + 1
                ).padStart(2, "0") +
                "-" +
                String(
                    oDate.getDate()
                ).padStart(2, "0");
        }

    };
});