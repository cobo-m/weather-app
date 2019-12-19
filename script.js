$(document).ready(function() {
  let days = ["Sunday","Monday","Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday","Monday","Tuesday", "Wednesday", "Thursday"];
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let todayDate = new Date();
  let todayDay = todayDate.getDay();
  let todayNumber = todayDate.getDate();
  let currentMonth = todayDate.getMonth();
  let currentHours = todayDate.getHours();
  let currentMinutes = todayDate.getMinutes();

  let dayStartsMinTemp = Math.floor((24 - currentHours) / 3) + 0;  // Ovdje +0 znaci da ce se temp uzimati za 1. 1/8 dana (2 bi znacilo vrijeme od 6:00h), a posto se prognoza dobije za
  let dayStartsMaxTemp = Math.floor((24 - currentHours) / 3) + 0;  // 40 narednih 1/8, ukoliko se postavi broj veci od 0, prognoza nece raditi za 5. dan, a time i ostatak koda.

  let weatherIcons = {
    "2" : "icons/icon-11.svg",
    "3" : "icons/icon-4.svg",
    "5" : "icons/icon-9.svg",
    "6" : "icons/icon-14.svg",
    "7" : "icons/icon-7.svg",
    "8" : "icons/icon-1.svg",
    "9" : "icons/icon-6.svg"
  };

  $(".today").replaceWith("<div class='today'><span>"+days[todayDay]+"</span>"+"<span class='datum'>"+todayNumber+" "+months[currentMonth]+"</span>"+"</div>");
  setInterval(function() {
    todayDate = new Date();
    $(".localTime").replaceWith("<div class='localTime'> "+todayDate.getHours()+" <div class='dot'> : </div> "+todayDate.getMinutes()+"</div>");
  }, 1000);

  for (let i = 0; i < 5; i++) {
    let nextDays = $("<span>"+days[todayDay+i+1]+"</span>");
    $(".day"+(i+2)).append(nextDays);
  }
  $("#findButton").click(function(e) {
    e.preventDefault();
    let city = $("#search").val();

    if(city !== "") {
      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/weather?q="+city+"&APPID=e11a3e51ff699b1fbef91ce28568b72b",
        success: function(data) {
          let firstNumbers = [];
          let firstNumber = data.weather[0].id;
          if (firstNumber > 800) {
            firstNumber = 900;
          }
          firstNumber = firstNumber.toString().charAt(0);
          firstNumbers.push(firstNumber);

          $(".todayWeatherImage img").remove();
          $(".todayWeatherImage").append("<img src="+weatherIcons[firstNumbers[0]]+">");
          $(".todayWeatherImage").hide().show("fast");

          $(".city span").replaceWith("<span>" + (city.charAt(0).toUpperCase()+city.slice(1)) + "</span>");
          $(".city span").hide(30).show("fast");
          setTimeout(function() {
            $(".temperatureToday").replaceWith("<div class='temperatureToday'> <span>" + (data.main.temp-273.15).toFixed(1) + "</span>°C</div>");
            $(".temperatureToday span").hide(30).show("fast");
          }, 200);
          setTimeout(function() {
            $(".humidity").replaceWith("<div class='humidity'> <span>" + data.main.humidity + "</span> %</div>");
            $(".humidity span").hide(30).show("fast");
          }, 200);
          setTimeout(function() {
            $(".windSpeed").replaceWith("<div class='windSpeed'> <span>" + data.wind.speed + "</span> km/h</div>");
            $(".windSpeed span").hide(30).show("fast");
          }, 250);
          setTimeout(function() {
            $(".pressure").replaceWith("<div class='pressure'> <span>" + data.main.pressure + "</span> mbar</div>");
            $(".pressure span").hide(30).show("fast");
          }, 250);

          setTimeout(function() {
            $.ajax({
              type: "GET",
              url: "https://api.openweathermap.org/data/2.5/forecast?q="+city+"&APPID=e11a3e51ff699b1fbef91ce28568b72b",
              success: function(data2) {
                for (let c = 0; c < 5; c++) {
                  firstNumber = data2.list[dayStartsMaxTemp + c*8].weather[0].id;
                  if (firstNumber > 800) {
                    firstNumber = 900;
                  }
                  firstNumber = firstNumber.toString().charAt(0);
                  firstNumbers.push(firstNumber);
                }

                let minTemps = [];
                let x = 0;

                let a = setInterval(function() {
                  let iconCurrent = $("<div><img src="+ weatherIcons[firstNumbers[(x+1)]] +"></div>");
                  let tempMax = $("<div class='tempMax'>"+ (data2.list[dayStartsMaxTemp+8*x].main.temp_max - 273.15).toFixed(1) +" °C</div>");
                  let tempMin = $("<div class='tempMin'>"+ (data2.list[dayStartsMinTemp+8*x].main.temp_min - 273.15).toFixed(1) +" °C</div>");
                  let speedX = $("<div class='speedX'>"+ (data2.list[dayStartsMinTemp+8*x].wind.speed).toFixed(1) +" km/h</div>");

                  $(".day2"+(x+2)).empty().append(iconCurrent).hide();
                  $(iconCurrent).fadeIn(700);
                  $(".day2"+(x+2)).append(tempMax);
                  $(tempMax).fadeIn(1100);
                  $(".day2"+(x+2)).append(tempMin);
                  $(tempMin).fadeIn(1600);
                  $(".day2"+(x+2)).append(speedX).fadeIn(2000);

                  minTemps.push(((data2.list[dayStartsMinTemp+8*x].main.temp_min - 273.15).toFixed(1)));
                  if(x == 4) {
                    console.log("ok");
                    clearInterval(a);
                  }
                  x++;
                }, 100);

                setTimeout(function() {
                  $(".warning").replaceWith("<div class='warning'> <p>Watch out on "+days[todayDay+minTemps.indexOf(Math.min.apply(Math, minTemps).toString())+1]+"! Temperature will go down to " +Math.min.apply(Math, minTemps)+ "°C</p></div>");
                  $(".warning").fadeIn("fast");
                }, 3500);
              }
            });
          }, 550);
        }
      });
    }
  });
});
