import { $http } from "@/common/http";
const request = $http;

export function getSmsCaptcha(telNum) {
    return $http.post('/hsprl/operate/srvmobile_note_send',[{
      "serviceName": "srvmobile_note_send",
      "data": [{
          "mobile": telNum
      }]
  }]).then(res=>{
    console.log(res.data.response?.[0]?.response)
    if(res.data.response?.[0]?.response?.bx_auth_ticket){
      sessionStorage.setItem('bx_auth_ticket',res.data.response?.[0]?.response?.bx_auth_ticket)
    }
  })
}
