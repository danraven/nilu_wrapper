jest.mock('../helper/request.js');

const ApiProxy = require('../app/ApiProxy.js');
const InMemoryStorage = require('../storage/InMemoryStorage');
const mockRequest = require('../helper/request.js');

const API_URL = 'http://api.example.tld';
let proxy;

beforeEach(() => {
    proxy = new ApiProxy(API_URL, new InMemoryStorage(), {
        info: jest.fn(),
        error: jest.fn()
    });
});

afterEach(() => {
    mockRequest.clear();
});

it('should do a query to the API the first time it fetches', async () => {
    const path = `${API_URL}/users`;
    const expectedResponse = [{
        id: 1,
        name: 'John Doe'
    }, {
        id: 2,
        name: 'Jane Doe'
    }];

    mockRequest.expectGetResponse(path, expectedResponse);

    const response = await proxy.get('/users');
    expect(response).toMatchObject({
        code: 200,
        message: 'OK',
        ok: true,
        type: 'application/json',
        body: expectedResponse
    });
    expect(mockRequest.requestCount()).toBe(1);
    expect(mockRequest.getLastResponse()).toMatchObject({
        url: path,
        ...response
    });
});

it('should cache the results of the API query', async () => {
    const path = `${API_URL}/user/1`;
    const expectedBody = { id: 1, name: 'John Doe' };
    const expectedResponse = {
        code: 200,
        message: 'OK',
        ok: true,
        type: 'application/json',
        body: expectedBody
    };

    mockRequest.expectGetResponse(path, expectedBody);

    const firstResponse = await proxy.get('/user/1');
    const secondResponse = await proxy.get('/user/1');

    expect(firstResponse).toMatchObject(expectedResponse);
    expect(firstResponse).toMatchObject(secondResponse);
    expect(mockRequest.requestCount()).toBe(1);
    expect(mockRequest.getLastResponse()).toMatchObject({
        url: path,
        ...firstResponse
    });
    expect(Object.keys(proxy.storage.storage)).toHaveLength(1);
});

it('should return the appropriate http code and message as well', async () => {
    const forbiddenResponse = {
        code: 403,
        message: 'Forbidden',
        ok: false,
        type: 'text/plain',
        body: ''
    };
    const notFoundResponse = {
        code: 404,
        message: 'Not Found',
        ok: false,
        type: 'text/plain',
        body: ''
    };

    mockRequest.expectGetResponse(`${API_URL}/admin`, '', 403, 'Forbidden', 'text/plain');

    const firstResponse = await proxy.get('/admin');
    const secondResponse = await proxy.get('/user/45');

    expect(mockRequest.requestCount()).toBe(2);
    expect(Object.keys(proxy.storage.storage)).toHaveLength(2);
    expect(firstResponse).toMatchObject(forbiddenResponse);
    expect(secondResponse).toMatchObject(notFoundResponse);
});