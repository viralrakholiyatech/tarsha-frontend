import React,{useRef} from 'react'
import {useReactToPrint} from "react-to-print";
import { ReactSVG } from 'react-svg'

var rows = [];

const pageStyle = `
  @page {
    size: 8.5in 11.75in;
    
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;

const Sample = () => {

    const componentRef = useRef();

    const data = [
        {
          id: "1",
          date: "6/14/1220",
          deposit: "43,630,584Tk",
          expense: "395,260,629Kc?",
          filename: "OrTravel",
          description: "Urn Plant",
          rec: "5"
        },
        {
          id: "2",
          date: "7/7/3958",
          deposit: "26,886,741Kc?",
          expense: "257,444,461f",
          filename: "Vrigo",
          description: "Buttercup",
          rec: "1"
        },
        {
          id: "3",
          date: "9/28/1453",
          deposit: "676,558,581Ft",
          expense: "404,653,098f",
          filename: "Avatar Mobile",
          description: "Veronica",
          rec: "7"
        },
        {
          id: "4",
          date: "8/28/1315",
          deposit: "51,491,350CFA",
          expense: "521,973,551Fr",
          filename: "Sist",
          description: "Millet",
          rec: "8"
        },
        {
          id: "5",
          date: "10/31/1095",
          deposit: "689,229,421Tk",
          expense: "830,084,177C$",
          filename: "Ingocal",
          description: "Periwinkle",
          rec: "5"
        },
        {
          id: "6",
          date: "2/28/3633",
          deposit: "449,903,725€",
          expense: "182,259,085HK$",
          filename: "Plalitaire",
          description: "Catmint",
          rec: "5"
        },
        {
          id: "7",
          date: "2/19/3176",
          deposit: "587,316,452Sk",
          expense: "726,540,619c",
          filename: "Yalp",
          description: "Mistletoe",
          rec: "0"
        },
        {
          id: "8",
          date: "9/17/4059",
          deposit: "228,099,967€",
          expense: "483,987,451€",
          filename: "Shost",
          description: "Apple",
          rec: "7"
        },
        {
          id: "9",
          date: "5/21/6286",
          deposit: "934,408,661c",
          expense: "63,815,008Sk",
          filename: "Run24",
          description: "Cornflower",
          rec: "0"
        },
        {
          id: "10",
          date: "12/3/0823",
          deposit: "893,881,928Kc?",
          expense: "449,848,952CFA",
          filename: "Page One Shop",
          description: "Dogwood",
          rec: "1"
        },
        {
          id: "11",
          date: "3/2/3331",
          deposit: "154,331,271lei",
          expense: "706,860,192CFA",
          filename: "Andes Shop",
          description: "Kauila",
          rec: "7"
        },
        {
          id: "12",
          date: "6/24/4145",
          deposit: "289,874,537Tk",
          expense: "193,545,723kn",
          filename: "Redsky",
          description: "Ironwood",
          rec: "3"
        },
        {
          id: "13",
          date: "10/8/1837",
          deposit: "394,844,822c",
          expense: "776,166,424f",
          filename: "Prayons",
          description: "Silene",
          rec: "8"
        },
        {
          id: "14",
          date: "10/21/7225",
          deposit: "370,773,147Tk",
          expense: "78,022,697RD$",
          filename: "Plalitaire",
          description: "Filipendula",
          rec: "5"
        },
        {
          id: "15",
          date: "7/18/2917",
          deposit: "55,322,571kn",
          expense: "796,568,935lei",
          filename: "Shost",
          description: "Ambrosia",
          rec: "4"
        },
        {
          id: "16",
          date: "1/11/3588",
          deposit: "106,969,005B$",
          expense: "330,129,553Kc?",
          filename: "Tracking Mobile",
          description: "Mangrove tree",
          rec: "6"
        },
        {
          id: "17",
          date: "8/31/7608",
          deposit: "530,234,897f",
          expense: "802,270,317RD$",
          filename: "Yola",
          description: "Apricot",
          rec: "5"
        },
        {
          id: "18",
          date: "6/6/4240",
          deposit: "379,281,749f",
          expense: "910,297,739C$",
          filename: "Fdeam",
          description: "Filipendula",
          rec: "3"
        },
        {
          id: "19",
          date: "1/27/4998",
          deposit: "43,781,687HK$",
          expense: "382,309,837kn",
          filename: "Plalitaire",
          description: "Manzanita",
          rec: "3"
        },
        {
          id: "20",
          date: "3/10/3593",
          deposit: "401,973,974MOP$",
          expense: "506,004,757€",
          filename: "Page One Shop",
          description: "Cotton plant",
          rec: "7"
        },
        {
          id: "21",
          date: "4/16/8144",
          deposit: "380,421,924MOP$",
          expense: "166,354,036B$",
          filename: "Crayze",
          description: "Apricot",
          rec: "3"
        },
        {
          id: "22",
          date: "7/16/7126",
          deposit: "144,176,163c",
          expense: "988,450,544MOP$",
          filename: "Paize",
          description: "Bilberry",
          rec: "2"
        },
        {
          id: "23",
          date: "4/5/8101",
          deposit: "924,191,015RD$",
          expense: "194,271,355Rp",
          filename: "Lopping",
          description: "Kentia Palm Plant",
          rec: "5"
        },
        {
          id: "24",
          date: "12/3/2754",
          deposit: "447,894,868CFA",
          expense: "963,901,431kn",
          filename: "Aor",
          description: "Bluebonnet",
          rec: "1"
        },
        {
          id: "25",
          date: "7/19/5206",
          deposit: "371,750,507c",
          expense: "135,625,819kn",
          filename: "DeskGet",
          description: "Kentia Palm Plant",
          rec: "4"
        },
        {
          id: "26",
          date: "11/23/4443",
          deposit: "617,871,170Rp",
          expense: "518,680,006CFA",
          filename: "MyGameNight",
          description: "Collard",
          rec: "3"
        },
        {
          id: "27",
          date: "12/30/1337",
          deposit: "794,498,471kn",
          expense: "769,858,706Kr",
          filename: "Sist",
          description: "Shasta Daisy",
          rec: "7"
        },
        {
          id: "28",
          date: "8/13/1090",
          deposit: "884,168,982B$",
          expense: "940,595,383Rp",
          filename: "Solaplay",
          description: "Arrowwood",
          rec: "3"
        },
        {
          id: "29",
          date: "3/21/6883",
          deposit: "24,183,773HK$",
          expense: "9,373,412Rp",
          filename: "Man Mobile",
          description: "Baobab",
          rec: "1"
        },
        {
          id: "30",
          date: "10/13/7379",
          deposit: "119,027,010€",
          expense: "805,186,676RD$",
          filename: "Fdeam",
          description: "Guaco",
          rec: "8"
        },
        {
          id: "31",
          date: "11/22/8479",
          deposit: "407,760,332Kc?",
          expense: "375,851,106€",
          filename: "Run24",
          description: "Dindle",
          rec: "4"
        },
        {
          id: "32",
          date: "1/6/2362",
          deposit: "564,331,821$",
          expense: "673,261,184lei",
          filename: "Bookoread",
          description: "Columbine",
          rec: "0"
        },
        {
          id: "33",
          date: "4/18/8095",
          deposit: "266,737,851C$",
          expense: "33,637,231Ft",
          filename: "Enmeet",
          description: "Clarkia",
          rec: "6"
        },
        {
          id: "34",
          date: "1/28/2940",
          deposit: "211,627,335B$",
          expense: "567,096,067RD$",
          filename: "Ytrap",
          description: "Birch",
          rec: "7"
        },
        {
          id: "35",
          date: "4/24/3937",
          deposit: "381,743,469f",
          expense: "341,706,160HK$",
          filename: "MyGameNight",
          description: "Easter orchid",
          rec: "0"
        },
        {
          id: "36",
          date: "2/9/5274",
          deposit: "733,614,535MOP$",
          expense: "800,598,520c",
          filename: "BeReady",
          description: "Chamomile",
          rec: "6"
        },
        {
          id: "37",
          date: "8/9/5999",
          deposit: "345,604,607B$",
          expense: "380,630,630MOP$",
          filename: "ReadABook",
          description: "Fellenwort",
          rec: "6"
        },
        {
          id: "38",
          date: "4/11/3690",
          deposit: "544,016,071Rp",
          expense: "189,092,468C$",
          filename: "Nime",
          description: "Bearberry",
          rec: "6"
        },
        {
          id: "39",
          date: "10/10/7861",
          deposit: "41,855,542Fr",
          expense: "659,606,414€",
          filename: "Man Mobile",
          description: "Mugwort",
          rec: "0"
        },
        {
          id: "40",
          date: "11/26/1508",
          deposit: "998,954,088B$",
          expense: "58,814,078Kr",
          filename: "Rook",
          description: "Dogwood",
          rec: "2"
        },
        {
          id: "41",
          date: "8/13/7655",
          deposit: "718,444,368B$",
          expense: "603,397,128RD$",
          filename: "Aor",
          description: "Shasta Daisy",
          rec: "6"
        },
        {
          id: "42",
          date: "6/22/2373",
          deposit: "967,453,653lei",
          expense: "503,945,229lei",
          filename: "ROF",
          description: "Birch",
          rec: "5"
        },
        {
          id: "43",
          date: "5/11/2469",
          deposit: "390,554,224€",
          expense: "808,239,937Rp",
          filename: "Run24",
          description: "Poppy",
          rec: "5"
        },
        {
          id: "44",
          date: "7/14/3926",
          deposit: "746,875,179Rp",
          expense: "237,427,715Rp",
          filename: "Nime",
          description: "Poppy",
          rec: "5"
        },
        {
          id: "45",
          date: "2/14/7993",
          deposit: "222,809,713c",
          expense: "75,490,357Rp",
          filename: "Prayons",
          description: "Morning Glory",
          rec: "0"
        },
        {
          id: "46",
          date: "4/4/5882",
          deposit: "34,634,829f",
          expense: "391,179,928c",
          filename: "Baywtch",
          description: "Symphytum",
          rec: "1"
        },
        {
          id: "47",
          date: "11/10/2004",
          deposit: "103,384,335MOP$",
          expense: "805,358,853HK$",
          filename: "Baywtch",
          description: "Mangrove tree",
          rec: "8"
        },
        {
          id: "48",
          date: "12/1/1407",
          deposit: "672,568B$",
          expense: "640,452,970Kc?",
          filename: "Aor",
          description: "Hedge plant",
          rec: "1"
        },
        {
          id: "49",
          date: "9/22/1550",
          deposit: "114,362,273Kc?",
          expense: "41,850,615Rp",
          filename: "OrTravel",
          description: "Guaco",
          rec: "0"
        },
        {
          id: "50",
          date: "1/9/2803",
          deposit: "525,001,670f",
          expense: "60,491,343Fr",
          filename: "Shoplist",
          description: "Primrose",
          rec: "6"
        },
        {
          id: "51",
          date: "6/20/5506",
          deposit: "361,489,794C$",
          expense: "961,779,538B$",
          filename: "Lopping",
          description: "Buttercup",
          rec: "2"
        },
        {
          id: "52",
          date: "4/16/4162",
          deposit: "178,107,549f",
          expense: "936,086,328HK$",
          filename: "Sist",
          description: "Huckleberry",
          rec: "6"
        },
        {
          id: "53",
          date: "11/1/4094",
          deposit: "117,582,856C$",
          expense: "357,262,756Ft",
          filename: "Plalitaire",
          description: "Tulip",
          rec: "7"
        },
        {
          id: "54",
          date: "3/30/5486",
          deposit: "641,115,392HK$",
          expense: "257,579,879kn",
          filename: "Run24",
          description: "Aspen",
          rec: "1"
        },
        {
          id: "55",
          date: "9/17/0596",
          deposit: "760,909,589HK$",
          expense: "639,789,733€",
          filename: "Shoplist",
          description: "Huckleberry",
          rec: "2"
        },
        {
          id: "56",
          date: "12/9/3077",
          deposit: "532,615,362kn",
          expense: "385,418,245c",
          filename: "BeReady",
          description: "Fig",
          rec: "6"
        },
        {
          id: "57",
          date: "1/16/6497",
          deposit: "355,889,157kn",
          expense: "972,376,614€",
          filename: "Crayze",
          description: "Dogwood",
          rec: "2"
        },
        {
          id: "58",
          date: "12/25/3002",
          deposit: "625,690,609$",
          expense: "356,690,544$",
          filename: "Gusto Mobile",
          description: "Pansy",
          rec: "4"
        },
        {
          id: "59",
          date: "10/20/6972",
          deposit: "540,864,965CFA",
          expense: "5,799,073f",
          filename: "Page One Shop",
          description: "Birch",
          rec: "8"
        },
        {
          id: "60",
          date: "7/31/9277",
          deposit: "393,806,085Tk",
          expense: "203,467,690kn",
          filename: "Arty",
          description: "Alstroemeria",
          rec: "1"
        },
        {
          id: "61",
          date: "10/12/6111",
          deposit: "986,881,704c",
          expense: "857,314,173C$",
          filename: "Bookoread",
          description: "Cactus",
          rec: "6"
        },
        {
          id: "62",
          date: "8/11/5485",
          deposit: "308,700,040Ft",
          expense: "727,412,052f",
          filename: "Nime",
          description: "Chamomile",
          rec: "2"
        },
        {
          id: "63",
          date: "2/21/9735",
          deposit: "349,338,137Fr",
          expense: "378,222,364Sk",
          filename: "Lopping",
          description: "Drumstick",
          rec: "6"
        },
        {
          id: "64",
          date: "8/23/0590",
          deposit: "430,004,650Kr",
          expense: "648,653,421Kr",
          filename: "Shoplist",
          description: "Goldenrod",
          rec: "6"
        },
        {
          id: "65",
          date: "8/19/2553",
          deposit: "68,889,326lei",
          expense: "675,011,441Sk",
          filename: "Ingocal",
          description: "Bearberry",
          rec: "2"
        },
        {
          id: "66",
          date: "7/4/6853",
          deposit: "774,575,811RD$",
          expense: "624,389,689Sk",
          filename: "LilyGrate",
          description: "Bearberry",
          rec: "2"
        },
        {
          id: "67",
          date: "11/18/9451",
          deposit: "65,165,343Rp",
          expense: "626,317,437kr",
          filename: "Andes Shop",
          description: "Red Hot Poker Plant",
          rec: "0"
        },
        {
          id: "68",
          date: "10/5/2536",
          deposit: "815,106,464kr",
          expense: "146,012,306RD$",
          filename: "Aor",
          description: "Candytuft",
          rec: "7"
        },
        {
          id: "69",
          date: "5/1/1642",
          deposit: "258,926,715f",
          expense: "844,508,792Kc?",
          filename: "Ytrap",
          description: "Primrose",
          rec: "0"
        },
        {
          id: "70",
          date: "1/15/1473",
          deposit: "173,360,061Sk",
          expense: "693,572,577Sk",
          filename: "Lopping",
          description: "Dumb Cane",
          rec: "2"
        },
        {
          id: "71",
          date: "9/10/2077",
          deposit: "259,345,379RD$",
          expense: "257,471,601€",
          filename: "Crayze",
          description: "Chinese Evergreen",
          rec: "6"
        },
        {
          id: "72",
          date: "11/24/1942",
          deposit: "106,383,338lei",
          expense: "731,001,294RD$",
          filename: "Avatar Mobile",
          description: "Dumb Cane",
          rec: "2"
        },
        {
          id: "73",
          date: "12/27/8577",
          deposit: "786,333,145Fr",
          expense: "962,874,113Ft",
          filename: "MyGameNight",
          description: "Cabbage",
          rec: "8"
        },
        {
          id: "74",
          date: "5/19/6303",
          deposit: "236,885,288RD$",
          expense: "470,657,387$",
          filename: "Partnip",
          description: "Mugwort",
          rec: "0"
        },
        {
          id: "75",
          date: "3/31/6176",
          deposit: "160,946,222Tk",
          expense: "970,716,604kr",
          filename: "Yalp",
          description: "Ironwood",
          rec: "4"
        },
        {
          id: "76",
          date: "6/2/0442",
          deposit: "310,305,010kr",
          expense: "137,701,191B$",
          filename: "Mettcal",
          description: "Fig",
          rec: "2"
        },
        {
          id: "77",
          date: "2/18/3584",
          deposit: "794,718,037Ft",
          expense: "762,118,838€",
          filename: "Orty",
          description: "Cotton plant",
          rec: "8"
        },
        {
          id: "78",
          date: "12/3/1761",
          deposit: "547,173,737Fr",
          expense: "755,558,860CFA",
          filename: "Solaplay",
          description: "Cup Flower",
          rec: "3"
        },
        {
          id: "79",
          date: "4/4/9867",
          deposit: "661,477,174B$",
          expense: "919,425,397kn",
          filename: "Yalp",
          description: "Coneflower",
          rec: "1"
        },
        {
          id: "80",
          date: "8/3/4863",
          deposit: "347,614,542kr",
          expense: "416,157,378C$",
          filename: "Run24",
          description: "Elephant Ear",
          rec: "7"
        },
        {
          id: "81",
          date: "8/17/2211",
          deposit: "644,428,591Ft",
          expense: "358,345,501B$",
          filename: "Tracking Mobile",
          description: "Mugwort",
          rec: "5"
        },
        {
          id: "82",
          date: "8/27/7371",
          deposit: "339,486,064Kc?",
          expense: "388,641,420CFA",
          filename: "Fdeam",
          description: "Bluebonnet",
          rec: "4"
        },
        {
          id: "83",
          date: "11/3/3888",
          deposit: "29,765,659kr",
          expense: "788,362,766HK$",
          filename: "Resinagro",
          description: "Columbine",
          rec: "3"
        },
        {
          id: "84",
          date: "12/17/0656",
          deposit: "30,124,844Kr",
          expense: "756,305,735c",
          filename: "Partnip",
          description: "Tulip",
          rec: "2"
        },
        {
          id: "85",
          date: "11/10/2945",
          deposit: "205,149,881HK$",
          expense: "114,056,848RD$",
          filename: "Sist",
          description: "Nemesia",
          rec: "3"
        },
        {
          id: "86",
          date: "2/25/1289",
          deposit: "870,791,931kr",
          expense: "976,088,835HK$",
          filename: "Enmeet",
          description: "Goldenrod",
          rec: "7"
        },
        {
          id: "87",
          date: "4/21/1928",
          deposit: "824,212,367Fr",
          expense: "749,109,702lei",
          filename: "DeskGet",
          description: "Chestnut",
          rec: "1"
        },
        {
          id: "88",
          date: "7/18/9838",
          deposit: "381,208,891MOP$",
          expense: "625,378,224lei",
          filename: "Andes Shop",
          description: "Eucalyptus",
          rec: "8"
        },
        {
          id: "89",
          date: "11/12/9001",
          deposit: "682,948,236C$",
          expense: "352,588,850kn",
          filename: "Sist",
          description: "Clarkia",
          rec: "5"
        },
        {
          id: "90",
          date: "9/29/7593",
          deposit: "685,701,745CFA",
          expense: "722,784,972HK$",
          filename: "Solaplay",
          description: "Chestnut",
          rec: "8"
        },
        {
          id: "91",
          date: "11/8/1264",
          deposit: "408,205,759RD$",
          expense: "930,778,207kr",
          filename: "Partnip",
          description: "Chinese Evergreen",
          rec: "2"
        },
        {
          id: "92",
          date: "4/22/4079",
          deposit: "574,489,880RD$",
          expense: "742,417,937Kc?",
          filename: "Koob",
          description: "Lucky Bamboo",
          rec: "2"
        },
        {
          id: "93",
          date: "7/31/4543",
          deposit: "973,629,726Sk",
          expense: "697,431,533Sk",
          filename: "Run24",
          description: "Fennel",
          rec: "5"
        },
        {
          id: "94",
          date: "4/29/5193",
          deposit: "657,074,782$",
          expense: "428,552,407Sk",
          filename: "Prayons",
          description: "Gillyflower",
          rec: "7"
        },
        {
          id: "95",
          date: "3/4/8174",
          deposit: "339,861,896B$",
          expense: "157,085,114Ft",
          filename: "MyGameNight",
          description: "Ginseng",
          rec: "0"
        },
        {
          id: "96",
          date: "5/16/8667",
          deposit: "672,083,595lei",
          expense: "962,867,010kn",
          filename: "Fdeam",
          description: "Bearberry",
          rec: "4"
        },
        {
          id: "97",
          date: "9/17/7586",
          deposit: "315,594,399Tk",
          expense: "157,185,565Sk",
          filename: "Partnip",
          description: "Tulip",
          rec: "6"
        },
        {
          id: "98",
          date: "10/11/8679",
          deposit: "386,378,725$",
          expense: "652,604,461lei",
          filename: "Tracking Mobile",
          description: "Indian paintbrush",
          rec: "3"
        },
        {
          id: "99",
          date: "4/16/2574",
          deposit: "944,226,918MOP$",
          expense: "793,961,502Sk",
          filename: "Sist",
          description: "Dumb Cane",
          rec: "6"
        },
        {
          id: "100",
          date: "12/13/5168",
          deposit: "691,652,635€",
          expense: "911,660,765C$",
          filename: "Plalitaire",
          description: "Vervain",
          rec: "5"
        }
      ];

    const handlePrint = useReactToPrint({
        content:()=>componentRef.current,
        documentTitle:"emp-data",
        onAfterPrint:()=>alert("Print done")
    })

  return (
    <>
    <button className='btn' onClick={handlePrint}>Print</button>
    <hr/>
    {/* <style>{pageStyle}</style> */}
    {/* style={{width:"100%",height:"3508px"}} */}
        <div ref={componentRef} >
           {data.map((d,i,data)=>{
                rows.push(d);
                if((i+1)%10==0 || data.length==(i+1)){
                    const ele = [...rows];
                    rows = []
                    return <DefaultPic data={ele} pageNumber={(i+1)/10}/>
                }

            
            })}
        </div>
        
    </>
  )
}

// header: {
//     fontSize: 12,
//     marginBottom: 20,
//     textAlign: 'center',
//     color: 'grey',
//   },
//   pageNumber: {
//     position: 'absolute',
//     fontSize: 12,
//     bottom: 30,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     color: 'grey',
//   },


const headerStyle = {
    fontSize: 12,
    marginBottom: 20,
    // textAlign: 'center',
    // color: 'grey',
}

const pageNumberStyle = {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey'
}

const DefaultPic = ({data,pageNumber}) =>{
    return (
        <>
        
        <div className="container" style={{pageBreakBefore:'always'}}>
        <div className="div m-5">
        <img src="https://www.zaidexceldesign.com/img/logo.svg" height={"200px"} width={"200px"}/>
               </div>



                <div className='d-flex justify-content-between'>
                    <div>
                        <h5>Dhawal Parmar</h5>
                        <h5>Deposit Expense Data</h5>
                    </div>
                    <div>
                        <h5>Date : 17-11-2022</h5>
                    </div>
                </div>


                <table className='table table-striped'>
                    <thead className='thead-dark'>
                        <tr>
                            <th>No</th>
                            <th>Date</th>
                            <th>Deposit</th>
                            <th>Expense</th>
                            <th>File name</th>
                            <th>Description</th>
                            <th>Rec</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* <tr>
                            <td>1</td>
                            <td>17-11-2022</td>
                            <td style={{color:'green'}}>1000</td>
                            <td style={{color:'green'}}>500</td>
                            <td>MyFile</td>
                            <td>No desc</td>
                            <td>--</td>
                        </tr> */}
                        {data.map((e,i)=>(
                            <tr>
                                <td>{e?.id}</td>
                                <td>{e?.date}</td>
                                <td>{e?.deposit}</td>
                                <td>{e?.expense}</td>
                                <td>{e?.filename}</td>
                                <td>{e?.description}</td>
                                <td>{e?.rec}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{pageNumberStyle}}> Page {pageNumber}</div>
{/* 
                <div className='d-flex justify-content-between'>
                    <div>
                        
                    </div>
                    <div>
                        
                    </div>
                  
                </div> */}

           </div>
           </>
    )
}

export default Sample