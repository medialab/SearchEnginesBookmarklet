function gen_dropdown_list(search){
  let dropdown_list = ['Google', 'DuckDuckGo', 'Bing', 'Qwant', 'Baidu', 'Google Scholar', 'Google Images', 'DuckDuckGo Images'];
  dropdown_list = dropdown_list.filter(item => item !== search);
  return dropdown_list;
};

function add_values_dropdown(search){
  const dropdown = document.getElementById('BMdropdown');
  const options = gen_dropdown_list(search);

  dropdown.innerHTML = '';

  options.forEach(optionValue => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    dropdown.appendChild(option);
  });
};

function redirect_engine(engine, query){
  switch(engine){
    case "Google":
      window.location.href = "https://www.google.com/search?q=" + query + "&num=100&start=0";
      break;
    case "DuckDuckGo":
      window.location.href = "https://duckduckgo.com/?t=h_&q=" + query + "&ia=web";
      break;
    case "Bing":
      window.location.href = "https://www.bing.com/search?q=" + query + "&first=0&count=30&FORM=PERE";
      break;
    case "Qwant":
      window.location.href = "https://www.qwant.com/?l=fr&q=" + query + "&t=web";
      break;
    case "Baidu":
      window.location.href = "https://www.baidu.com/s?wd=" + query + "&pn=0&rn=50";
      break;
    case "Scholar":
      window.location.href = "https://scholar.google.com/scholar?q=" + query + "&hl=fr&num=20&start=0";
      break;
    case "Google Images":
      window.location.href = "https://www.google.com/search?num=100&q=" + query + "&udm=2";
      break;
    case "DuckDuckGo Images":
      window.location.href = "https://duckduckgo.com/?t=h_&q=" + query + "&iax=images&ia=images";
      break;
    default:
      break;
  }
};
