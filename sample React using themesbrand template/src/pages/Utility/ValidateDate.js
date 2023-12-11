export const ValidateDate  = (inputText) => {
        // var dateformat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
        let dateformat = /^(19|20)\d\d([- /.])(0?[1-9]|1[012])\2(0?[1-9]|[12][0-9]|3[01])$/;
        // Match the date format through regular expression
        let date = inputText._i != undefined ? inputText._i : inputText;
        if (dateformat.test(date)) {
          //Test which seperator is used '/' or '-'
          var opera1 = date.split('/');
          var opera2 = date.split('-');
          let lopera1 = opera1.length;
          let lopera2 = opera2.length;
          // Extract the string into month, date and year
          if (lopera1 > 1) {
            var pdate = date.split('/');
          }
          else if (lopera2 > 1) {
            var pdate = date.split('-');
          }
          else {
            return false;
          }
          var yy = parseInt(pdate[0]);
          var mm = parseInt(pdate[1]);
          var dd = parseInt(pdate[2]);
          // Create list of days of a month [assume there is no leap year by default]
          var ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          if (mm == 1 || mm > 2) {
            if (dd > ListofDays[mm - 1]) {
              return false;
            }
          }
          if (mm == 2) {
            var lyear = false;
            if ((!(yy % 4) && yy % 100) || !(yy % 400)) {
              lyear = true;
            }
            if ((lyear == false) && (dd >= 29)) {
              return false;
            }
            if ((lyear == true) && (dd > 29)) {
              return false;
            }
            return true;
          }
          return true;
        }
        else {
          return false;
        }
      }