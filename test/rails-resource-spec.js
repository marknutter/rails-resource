/*
 * Unit test for railsResource:
 *
 * railsResource is a wrapper for ngResource to enable the ability
 * to strip root nodes out of incoming data, and whitelist to allow
 * only certain resource assets to be sent to the server
 */
describe('Service: railsResource', function () {

  var $httpBackend,
      session,
      Resource,
      findSpy,
      mergeSpy,
      allSpy,
      mockStore;

  beforeEach(module('railsResource'));

  beforeEach(function() {
    var fakeSession = {
      addBaseDomainForResource: jasmine.createSpy('addBaseDomainForResource').andCallFake(function(value) {
        return value;
      })
    };

    module(function($provide) {

    });

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      var railsResource = $injector.get('railsResource');

      Resource = railsResource('resources/:id.json',
          { /* default params */ },
          {
            create:{method:'POST', action:"create", isArray:false},
            update:{method:'PUT', action:"update", isArray:false},
            show:{method:'GET', action:"show", isArray:false},
            destroy:{method:'GET', action:"destroy", isArray:false},
            index:{method:'GET', action:"destroy", isArray:true}
          },
          {rootNode:"resource", whitelist:["foo"]}
      );


    });
  });


  it("should support 'create'", inject(function () {
    $httpBackend.expectPOST('resources.json', {resource:{foo:'zap'}}).respond({ resource:{id:1, foo:'zap'}});
    var resource = new Resource({foo:'zap'});
    resource.$create();
    $httpBackend.flush();

    // should strip out the node
    expect(resource.id).toBe(1);
  }));

  it("should support 'update'", inject(function () {
    // should only whitelisted attributes
    $httpBackend.expectPUT('resources/1.json', {resource:{foo:'zap'}}).respond({ resource:{id:1, foo:'zap'}});
    var resource = new Resource({id:1, foo:'bar', baz:"awesome"});
    resource.foo = 'zap';
    resource.$update();
    $httpBackend.flush();

    // should strip out the node
    expect(resource.foo).toBe("zap");
  }));

  it("should support 'save' on create", inject(function () {
    // save on a new item should call CREATE
    $httpBackend.expectPOST('resources.json').respond({ resource:{id:1, foo:'bar'} });
    var resource = new Resource({foo:'bar'});
    resource.$save();
    $httpBackend.flush();
  }));

  it("should support 'save' on update", inject(function () {
    // save on an existing item should call UPDATE
    $httpBackend.expectPUT('resources/1.json').respond({ resource:{id:1, foo:'baz'} });
    var resource = new Resource({id:1, foo:'baz'});
    expect(resource.id).toBe(1);
    resource.$save();
    $httpBackend.flush();
  }));

  it("should support 'index'", inject(function () {
    $httpBackend.expectGET('resources.json').respond([
      { resource:{id:1, foo:'bar'}},
      { resource:{id:2, foo:'flam'}}
    ]);
    var resources;
    resources = Resource.index();
    $httpBackend.flush();
    expect(resources.length).toBe(2);
    // should strip out the nodes
    expect(resources[0].foo).toBe("bar");
  }));

  it("should support 'show'", inject(function () {
    // should try to find in store, fail, and then use ajax on first show
    $httpBackend.expectGET('resources/1.json').respond({ resource:{id:1, foo:'bar'} });
    var resource = Resource.show({id:1});
    $httpBackend.flush();
    expect(resource.foo).toBe('bar');
  }));

  it("should coerce rails date to js date", inject(function () {
    // 1041531753000 == 1/2/3 11:22:33 MST  (2003-01-03).
    var when = 1041531753000;
    $httpBackend.expectGET('resources/1.json').respond({ resource:{id:1, foo:'bar', created_at: when} });
    var resource = Resource.show({id:1});
    $httpBackend.flush();
    expect(resource.created_at.toUTCString()).toBe('Thu, 02 Jan 2003 18:22:33 GMT');
  }));

  // it("should coerce rails data on construction", inject(function () {
  //   // 1041531753000 == 1/2/3 11:22:33 MST  (2003-01-03).
  //   var when = 1041531753000;
  //   var resource = new Resource({resource: {id:1, created_at: when}});
  //   expect(resource.id).toBe(1);
  //   expect(resource.created_at.toUTCString()).toBe('Thu, 02 Jan 2003 18:22:33 GMT');
  // }));
});
