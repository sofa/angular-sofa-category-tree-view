angular.module('sofa.categoryTreeView')
    .directive('sofaNestedCategoryItem', 
        function ($compile, categoryTreeViewRemote, navigationService) {

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
        });
