/* app.js */

(function() {
    var ZXCVBN_SRC = 'bower_components/zxcvbn/dist/zxcvbn.js';

    var async_load = function() {
        var first, s;
        // create a <script> element using the DOM API
        s = document.createElement('script');

        // set attributes on the script element
        s.src = ZXCVBN_SRC;
        s.type = 'text/javascript';
        s.async = true; // HTML5 async attribute

        // Get the first script element in the document
        first = document.getElementsByTagName('script')[0];

        // insert the <script> element before the first in the document
        return first.parentNode.insertBefore(s, first);
    };

    // attach async_load as callback to the window load event
    if (window.attachEvent != null) {
        window.attachEvent('onload', async_load);
    } else {
        window.addEventListener('load', async_load, false);
    }
}).call(this);

// creating the app module
angular.module('PasswordStrength', []);

// adding a controller to the module
angular.module('PasswordStrength').controller('FormController', function($scope) {});

// creating the passwordCount filter
angular.module('PasswordStrength').filter('passwordCount', [function() {
    return function(value, peak) {
        var value = angular.isString(value) ? value : '',
        peak = isFinite(peak) ? peak : 7;

        return value && (value.length > peak ? peak + '+' : value.length);
    };
}]);

// creating a service to provide zxcvbn() functionality
angular.module('PasswordStrength').factory('zxcvbn', [function() {
    return {
        score: function() {
            var compute = zxcvbn.apply(null, arguments);
            return compute && compute.score;
        }
    };
}]);

// creating the okPassword directive with zxcvbn as dependency
angular.module('PasswordStrength').directive('okPassword', ['zxcvbn', function(zxcvbn) {
    return {
        // restrict to only attribute and class
        restrict: 'AC',

        // use the NgModelController
        require: 'ngModel',

        // add the NgModelController as a dependency to your link function
        link: function($scope, $element, $attrs, ngModelCtrl) {
            $element.on('blur change keydown', function(evt) {
                $scope.$evalAsync(function($scope) {
                    // update the $scope.password with the element's value
                    var pwd = $scope.password = $element.val();

                    // resolve password strength score using zxcvbn service
                    $scope.passwordStrength = pwd ? (pwd.length > 7 && zxcvbn.score(pwd) || 0)
                    : null;

                    // define the validity criterion for okPassword constraint
                    ngModelCtrl.$setValidity('okPassword', $scope.passwordStrength >= 2);
                });
            });
        }
    };
}]);
