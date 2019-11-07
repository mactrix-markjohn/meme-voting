const contractAddress = 'ct_2hUu7gyz2qfDLdpjRXkaBbkrGwpLRV2wmL7MEyFaaeZEqwak8i';
var client = null;
var memeArray = [];
var memesLength = 0;

function renderMemes() {
  memeArray = memeArray.sort(function(a,b){return b.votes-a.votes})
  var template = $('#template').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template,{memeArray});
  $('#memeBody').html(rendered);
}

async function callStatic(func, args) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledGet = await contract.call(func, args ,{callStatic: true}).catch(e => console.error(e));
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;

}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}


window.addEventListener('load',async () => {
  $("#loader").show();

  client = await Ae.Aepp();

  memesLength = await callStatic('getMemesLength', []);

  for (let i = 1; i <= memesLength; i++) {
    const meme = await callStatic('getMeme', [i]);

    memeArray.push({
      creatorName: meme.name,
      memeUrl: meme.url,
      index: i,
      votes: meme.voteCount,
    });

  }

  renderMemes();

  $("#loader").hide();
});

jQuery("#memeBody").on("click", ".voteBtn", async function(event){
  $("#loader").show();

  const value = $(this).siblings('input').val();
  const dataIndex = event.target.id;

  await contractCall('voteMeme',[dataIndex], value);

  const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
  memeArray[foundIndex].votes += parseInt(value, 10);
  renderMemes();

  $("#loader").hide();
});

$('#registerBtn').click(async function(){
  $("#loader").show();

  const name = ($('#regName').val()),
      url = ($('#regUrl').val());

  await contractCall('registerName', [url, name], 0);

    memeArray.push({
      creatorName: name,
      memeUrl: url,
      index: memeArray.length+1,
      votes: 0
    });

    renderMemes();

    $("#loader").hide();

})
