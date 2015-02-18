'use strict';

describe('sofa.categoryTreeView', function () {

    var element, $compile, $rootScope, $httpBackend, document = window.document;

    beforeEach(module('sofa.categoryTreeView'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_; 
        $httpBackend.when('GET', 'data/couchdemoshop/categories.json').respond({
            label: 'test',
            children: [{
                label: 'testChild',
                children: [{
                    label: 'testChildChild'
                }]
            }]
        });
    }));

    it('should display child categories', function () {
        element = $compile('<sofa-category-tree-view></sofa-category-tree-view>')($rootScope);
        $httpBackend.flush();
        angular.element(document.querySelector('body')).append(element);
        $rootScope.$digest();
        expect(
            document.querySelector('ul li:first-child a').innerText.trim()
        ).toEqual('testChild');
    });

    it('should display child categories of children', function () {
        element = $compile('<sofa-category-tree-view></sofa-category-tree-view>')($rootScope);
        $httpBackend.flush();
        angular.element(document.querySelector('body')).append(element);
        $rootScope.$digest();
        expect(
            document.querySelectorAll('ul li ul li:first-child a')[1].innerText.trim()
        ).toEqual('testChildChild');
    });
});
