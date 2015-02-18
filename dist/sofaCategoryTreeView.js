/**
 * angular-sofa-category-tree-view - v0.1.0 - Wed Feb 18 2015 14:37:18 GMT+0100 (CET)
 * http://www.sofa.io
 *
 * Copyright (c) 2014 CouchCommerce GmbH (http://www.couchcommerce.com / http://www.sofa.io) and other contributors
 * THIS SOFTWARE CONTAINS COMPONENTS OF THE SOFA.IO COUCHCOMMERCE SDK (WWW.SOFA.IO)
 * IT IS PROVIDED UNDER THE LICENSE TERMS OF THE ATTACHED LICENSE.TXT.
 */
;(function (angular) {
angular.module('sofa.categoryTreeView', [
        'sofa.templateCode',
        'sofa.navigationService',
        'sofa-category-tree-view.tpl.html'
    ]);

angular.module('sofa-category-tree-view.tpl.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('sofa-category-tree-view.tpl.html',
    '<div class="sofa-category-tree-view">\n' +
    '    <ul ng-class="{ \'sofa-category-tree-view__list--open\': item._categoryTreeView.isVisible,\n' +
    '                    \'sofa-category-tree-view__list--closed\': !item._categoryTreeView.isVisible,\n' +
    '                    \'sofa-category-tree-view__list--root\': isRoot,\n' +
    '                    \'sofa-category-tree-view__list--child\': !isRoot }" sofa-template-code>\n' +
    '       <li class="sofa-category-tree-view__list-item" sofa-nested-category-item ng-repeat="item in items">\n' +
    '           <a href="{{item.getOriginFullUrl()}}" ng-click="doAction($event, item)" class="sofa-category-tree-view__link"\n' +
    '               ng-class="{ \'sofa-category-tree-view__link--active\': item._categoryTreeView.isActive,\n' +
    '                           \'sofa-category-tree-view__link--has-children\': item.hasChildren,\n' +
    '                           \'sofa-category-tree-view__link--open\': item.hasChildren && item._categoryTreeView.isVisible }"\n' +
    '               ng-bind="item.label">\n' +
    '            </a>\n' +
    '       </li>\n' +
    '    </ul>\n' +
    '</div>\n' +
    '');
}]);

angular.module('sofa.categoryTreeView')
    .directive('sofaCategoryTreeView', ["couchService", "categoryTreeViewRemote", function (couchService, categoryTreeViewRemote) {

        'use strict';

        return {
            restrict: 'EA',
            scope: {},
            replace: true,
            templateUrl: 'sofa-category-tree-view.tpl.html',
            link: function ($scope) {
                couchService
                    .getCategory()
                    .then(function (rootCategory) {
                        $scope.items = rootCategory && rootCategory.children ? rootCategory.children : [];
                        $scope.item = rootCategory;
                        $scope.isRoot = true;
                        categoryTreeViewRemote.toggleVisibility(rootCategory);

                        $scope.items.forEach(function (item) {
                            categoryTreeViewRemote.setItemLevel(item, 1);
                        });

                    });
            }
        };
    }]);

angular.module('sofa.categoryTreeView')
    .factory('categoryTreeViewRemote', function () {

        'use strict';

        var self = {};

        var activeItem = null;

        self.setActive = function (item) {
            asurePrivateStore(item);

            if (activeItem) {
                activeItem._categoryTreeView.isActive = false;
            }

            item._categoryTreeView.isActive = true;
            self.setVisibility(item, true, true);

            activeItem = item;
        };

        self.setVisibility = function (item, visbility, upwardsRecursive) {
            asurePrivateStore(item);
            item._categoryTreeView.isVisible = visbility;
            if (item.parent && upwardsRecursive) {
                self.setVisibility(item.parent, visbility, upwardsRecursive);
            }
        };

        self.toggleVisibility = function (item) {
            asurePrivateStore(item);
            item._categoryTreeView.isVisible = !item._categoryTreeView.isVisible;
        };

        self.setItemLevel = function (item, level) {
            asurePrivateStore(item);
            item._categoryTreeView.level = level;
        };

        var asurePrivateStore = function (item) {
            if (!item._categoryTreeView) {
                item._categoryTreeView = { isVisible: false };
            }
        };

        return self;
    });

angular.module('sofa.categoryTreeView')
    .directive('sofaNestedCategoryItem', 
        ["$compile", "categoryTreeViewRemote", "navigationService", function ($compile, categoryTreeViewRemote, navigationService) {

            'use strict';

            return {
                restrict: 'A',
                require: '^sofaTemplateCode',
                link: function ($scope, $element, attributes, controller) {
                    $scope.isRoot = false;
                    if ($scope.item.children) {
                        $scope.items = $scope.item.children;
                        var html = $compile(controller.templateCode)($scope);
                        $element.append(html);
                    }
                    $scope.remoteControl = categoryTreeViewRemote;

                    $scope.doAction = function ($event, item) {
                        $event.preventDefault();
                        if (!item.hasChildren) {
                            categoryTreeViewRemote.setActive(item);
                            navigationService.navigateToUrl(item.getOriginFullUrl());
                        } else {
                            categoryTreeViewRemote.toggleVisibility(item);
                        }
                    };
                }
            };
        }]);
}(angular));
