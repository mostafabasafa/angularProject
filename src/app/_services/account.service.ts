import {Injectable} from "@angular/core";
import {BehaviorSubject, forkJoin, map, Observable} from "rxjs";
import {User} from "../_models/user";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Province} from "../_models/province";
import {City} from "../_models/city";
import {ProvinceArea} from "../_models/provinceArea";
import {CityArea} from "../_models/cityArea";
import {JwtHelperService} from "@auth0/angular-jwt";
// import {JwtInterceptor} from "../_helpers/jwt.interceptor";


@Injectable({providedIn: 'root'})
export class AccountService {

  private API_URL = 'http://localhost:3000/users';
  private API_URL_PROVICE = 'http://localhost:3000/provinces'
  private API_URL_CITY = 'http://localhost:3000/city'
  private API_URL_PROVICE_TEST = 'http://localhost:3000/provincetest'
  private API_URL_CITY_TEST = 'http://localhost:3000/citytest'
  private API_URL_PROVINCE_TEST = 'http://localhost:3000/provincetest'


  private userSubject!: BehaviorSubject<User>;
  private provinceSubject !: BehaviorSubject<Province>
  private provinceAreaSubject !: BehaviorSubject<ProvinceArea>
  private citySubject !: BehaviorSubject<City>
  public user!: Observable<User>;
  public province !: Observable<Province>
  public city !: Observable<City>
  public provinceList = [5]
  // declare require: any




  constructor(
    private router: Router,
    private http: HttpClient,
    private provinceHTTP: HttpClient,
    private cityHTTP: HttpClient,
    // private jwtInterceptor: JwtInterceptor
  ) {
    // @ts-ignore
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user') || '{}'));
    this.user = this.userSubject.asObservable()
    this.provinceSubject = new BehaviorSubject<Province>(JSON.parse(localStorage.getItem('province') || '{}'))
    this.citySubject = new BehaviorSubject<City>(JSON.parse(localStorage.getItem('city') || '{}'))
    this.provinceAreaSubject = new BehaviorSubject<ProvinceArea>(JSON.parse(localStorage.getItem('province') || '{}'))

  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  public get proviceValue(): Province {
    return this.provinceSubject.value
  }

  public get cityValue(): City {
    return this.citySubject.value
  }

  public get provinceAreaValue(): Province {
    return this.provinceSubject.value
  }


  addUser(user: User) {
    console.log('send')
    return this.http.post(this.API_URL, user)
  }


  getById(id: number) {
    return this.http.get<User>(this.API_URL + '/' + id)
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL)
  }

  update(id: number, params: any) {
    // console.log(params)
    return this.http.put(this.API_URL + '/' + id, params)
      .pipe(map(x => {
        if (id == this.userValue.id) {
          const user = {...this.userValue, ...params};
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }
        return x
      }))
  }

  delete(id: number) {
    console.log('inja hatman  ok mishe')
    return this.http.delete(this.API_URL + '/' + id).pipe(map(x => {

      }
    ))
  }

  setProvince(province: ProvinceArea) {
    console.log(Province)
    return this.provinceHTTP.post(this.API_URL_PROVICE, province)
  }

  getProvince() {
    return this.provinceHTTP.get<Province[]>(this.API_URL_PROVICE)
  }

  getProvinceById(id: number | string) {
    return this.provinceHTTP.get<Province>(this.API_URL_PROVICE + '/' + id)
  }


  setCity(city: City) {
    console.log(city)
    return this.cityHTTP.post(this.API_URL_CITY, city)
  }

  getAllCity(): Observable<City[]> {
    return this.cityHTTP.get<City[]>(this.API_URL_CITY)
  }

  getCity(provinceID: number | string) {
    return this.cityHTTP.get<City[]>(this.API_URL_CITY + '?provinceID=' + provinceID)
  }

  getCityById(id: number | string) {
    return this.cityHTTP.get<City>(this.API_URL_CITY + '/' + id)
  }

  paginate(page: number, limit: number) {
    return this.http.get<User[]>(this.API_URL + '?_page=' + page + '&_limit=' + limit)
  }

  paginateProvince(page: number, limit: number) {
    return this.http.get<User>(this.API_URL_PROVICE + '?_page=' + page + '&_limit=' + limit)
  }

  paginateCity(id: number | string, page: number, limit: number) {
    return this.cityHTTP.get(this.API_URL_CITY + '?provinceID=' + id + '&_page=' + page + '&_limit=' + limit)
  }

  paginateAllCity(page: number, limit: number) {
    return this.cityHTTP.get<City[]>(this.API_URL_CITY + '?_page=' + page + '&_limit=' + limit)
  }

  deleteProvince(id: number) {
    return this.provinceHTTP.delete(this.API_URL_PROVICE + '/' + id).pipe(map(x => {

      }
    ))
  }

  deleteCity(id: number) {
    return this.cityHTTP.delete(this.API_URL_CITY + '/' + id).pipe(map(x => {

      }
    ))
  }


  setCityTest(city: City) {
    // console.log(city)
    return this.cityHTTP.post(this.API_URL_CITY_TEST, city)
  }

  searchUser(character: string, page: number, limit: number) {
    return this.http.get<User[]>(this.API_URL + '?userName_like=' + character + '_page=' + page + '&_limit=' + limit)
  }

  searchAllUser(character: string) {
    return this.http.get<User[]>(this.API_URL + '?userName_like=' + character)
  }

  userCount() {
    return this.http.get<User[]>(this.API_URL + '?_page=1&_limit=5', {observe: "response"})
  }

  provinceCount() {
    return this.http.get<Province>(this.API_URL_PROVINCE_TEST + '?_page=1&_limit=5', {observe: "response"})
  }

  CityCount() {
    return this.http.get<Province>(this.API_URL_CITY_TEST + '?_page=1&_limit=5', {observe: "response"})
  }

  paginateProvinceTest(page: number, limit: number) {
    return this.http.get<User>(this.API_URL_PROVINCE_TEST + '?_page=' + page + '&_limit=' + limit, {observe: "response"})
  }

  getAllCityTest(): Observable<City[]> {
    return this.cityHTTP.get<City[]>(this.API_URL_CITY_TEST)
  }

  paginateAllCityTest(page: number, limit: number) {
    return this.cityHTTP.get<CityArea>(this.API_URL_CITY_TEST + '?_page=' + page + '&_limit=' + limit, {observe: "response"})
  }

  setProvinceTest(province: ProvinceArea) {
    // console.log(city)
    return this.provinceHTTP.post(this.API_URL_PROVINCE_TEST, province)
  }


  getProvinceTestById(id: number | string) {
    return this.provinceHTTP.get<ProvinceArea>(this.API_URL_PROVINCE_TEST + '/' + id)
  }

  updateProvince(id: number, params: any) {
    return this.http.put(this.API_URL_PROVINCE_TEST + '/' + id, params)
      .pipe(map(data => {
          if (id == this.provinceAreaValue.id) {
            const province = {...this.provinceAreaValue, ...params};
            localStorage.setItem('province', JSON.stringify(province));
            this.userSubject.next(province);
          }

        },
      ))
  }

  deleteProvinceTest(id: number) {
    return this.provinceHTTP.delete(this.API_URL_PROVINCE_TEST + '/' + id).pipe(map(x => {
      }
    ))
  }


  getProvinceNameTest() {
    return this.provinceHTTP.get<ProvinceArea[]>(this.API_URL_PROVICE_TEST + '?_embed=coordinates&_embed=area')
  }

  getCityTestById(cityId: number) {
    return this.provinceHTTP.get<CityArea>(this.API_URL_CITY_TEST + '/' + cityId)
  }

  getAllProvinceTest() {
    console.log('hi server')
    return this.provinceHTTP.get<ProvinceArea[]>(this.API_URL_PROVINCE_TEST)
  }

  login(loginData: { userName: string, password: string }) {
    return this.http.get<User[]>(this.API_URL + '?userName=' + loginData.userName + '&password=' + loginData.password)
      .pipe(map(user => {
        // const helper= this.require('jsonwebtoken')
        // const token= helper.sign('aaa', 'zzz', {
        //   algoritm: "NS256"
        // })
        // console.log('aaaaaaaaaa')
        // console.log(token)



        localStorage.setItem('user', JSON.stringify(user))
        this.userSubject.next(user[0])
        return user[0]
      }))

  }
}
