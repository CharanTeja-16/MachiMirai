from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MigrationProgram, Municipality
from app.schemas import (
    AttractivenessRadarDimension, MigrationSimulationRequest,
    MigrationSimulationResponse, CaseStudy
)

router = APIRouter(prefix="/api/migration", tags=["Migration Attraction Toolkit"])

@router.get("/scorecard/{municipality_id}", response_model=List[AttractivenessRadarDimension])
def get_attractiveness_scorecard(municipality_id: str, db: Session = Depends(get_db)):
    muni = db.query(Municipality).filter(Municipality.id == municipality_id).first()
    if not muni:
        raise HTTPException(status_code=404, detail="Municipality not found")

    # Dimensions: Jobs, Housing, Childcare, Nature/Lifestyle, Commute/Access, Digital Infrastructure, Medical Care
    # Realistic scores reflecting Minamiaso / rural Japanese strengths & weaknesses
    return [
        AttractivenessRadarDimension(
            dimension="自然・景観・生活環境",
            dimension_en="Nature & Environment",
            score=94.0,
            prefecture_avg=78.0,
            national_benchmark=65.0
        ),
        AttractivenessRadarDimension(
            dimension="住宅価格・空き家供給",
            dimension_en="Housing Affordability",
            score=82.0,
            prefecture_avg=70.0,
            national_benchmark=48.0
        ),
        AttractivenessRadarDimension(
            dimension="子育て・待機児童ゼロ",
            dimension_en="Childcare & Education",
            score=76.0,
            prefecture_avg=68.0,
            national_benchmark=62.0
        ),
        AttractivenessRadarDimension(
            dimension="光ファイバー・通信インフラ",
            dimension_en="Digital & Remote Work",
            score=85.0,
            prefecture_avg=72.0,
            national_benchmark=80.0
        ),
        AttractivenessRadarDimension(
            dimension="医療・介護アクセス",
            dimension_en="Medical & Health Care",
            score=58.0,
            prefecture_avg=65.0,
            national_benchmark=75.0
        ),
        AttractivenessRadarDimension(
            dimension="地域雇用・民間求人",
            dimension_en="Local Job Market",
            score=44.0,
            prefecture_avg=56.0,
            national_benchmark=72.0
        ),
        AttractivenessRadarDimension(
            dimension="公共交通・都市近郊アクセス",
            dimension_en="Transit & Mobility",
            score=52.0,
            prefecture_avg=62.0,
            national_benchmark=78.0
        )
    ]

@router.post("/simulate", response_model=MigrationSimulationResponse)
def simulate_migration_investment(req: MigrationSimulationRequest):
    """
    Quantifies the exact return on investment (ROI) of public funds
    invested into attracting young families and remote workers.
    """
    invest_yen = req.investment_yen
    category = req.investment_category

    # Cost-per-attracted family baseline in rural Japan policy studies (RIETI / Cabinet Office)
    # Childcare subsidy: ~¥2.2M per family attracted
    # Housing grant / Akiya: ~¥1.8M per family attracted
    # Remote Coworking hub: ~¥3.5M initial, but attracts higher earning digital nomads
    # Agribusiness: ~¥2.8M per household
    cost_per_family = {
        "childcare": 2200000,
        "housing_grant": 1800000,
        "remote_hub": 3200000,
        "agricultural_start": 2800000
    }.get(category, 2500000)

    families = max(1, int(invest_yen / cost_per_family))
    adults = int(families * 1.8)
    children = int(families * 1.4)

    # Average resident tax (住民税 + 固定資産税 + 地方消費税交付金) per working adult in rural town: ~¥280,000/yr
    # Plus school capitation subsidy from national government: ~¥350,000 per child/yr
    annual_tax_gain = int((adults * 280000) + (children * 350000))
    
    # 10-year cumulative tax revenue return
    ten_yr_tax = annual_tax_gain * 10
    net_roi_pct = round(((ten_yr_tax - invest_yen) / invest_yen) * 100, 1)
    payback_years = round(invest_yen / annual_tax_gain, 1) if annual_tax_gain > 0 else 99.0

    return MigrationSimulationResponse(
        investment_category=category,
        investment_yen=invest_yen,
        families_attracted=families,
        adults_working=adults,
        children_enrolled=children,
        annual_local_tax_gain_yen=annual_tax_gain,
        ten_year_cumulative_tax_yen=ten_yr_tax,
        ten_year_net_roi_pct=net_roi_pct,
        payback_years=payback_years
    )

@router.get("/case-studies", response_model=List[CaseStudy])
def get_case_studies():
    return [
        CaseStudy(
            town_name="神山町 (Kamiyama)",
            prefecture="徳島県 (Tokushima)",
            title="「緑のサテライトオフィス」全国先駆けのIT企業集積",
            summary="中山間地でありながら全域光ファイバー網を敷設。Sansanなど都内IT企業20社以上のサテライトオフィスを誘致し、若年単身者とクリエイティブ層の社会増を実現。",
            key_interventions=[
                "古民家を再生した高速光ブロードバンド対応シェアオフィス",
                "民間NPOグリーンバレーとの官民協働プロジェクト推進",
                "私立神山まるごと高専（デザイン・IT・起業）の開校"
            ],
            results_achieved="10年間で社会動態が転入超過へ転換。IT就業者・カフェ等の新規開業30件以上。",
            applicable_lessons="単なる補助金ではなく、クリエイティブ人材が集まるコミュニティと高速通信網の先行投資が奏功。"
        ),
        CaseStudy(
            town_name="鯖江市 (Sabae)",
            prefecture="福井県 (Fukui)",
            title="オープンデータ特区と女性活躍・メガネ産業高度化",
            summary="全国初のオープンデータ宣言自治体として、自治体保有データを全開放。市民エンジニアと連携した「jig.jp」等のIT拠点誘致とメガネ地場産業のグローバル高付加価値化。",
            key_interventions=[
                "行政保有データ（AED・観光・避難所）のXML/JSON即時オープン化",
                "若者・女性参加型の「鯖江市役所JK課」など独自参画プラットフォーム",
                "IoT×伝統メガネフレームのスマートグラス共同開発"
            ],
            results_achieved="福井県内でも若者定着率トップクラスを維持。国内外から視察年100件超。",
            applicable_lessons="データと住民参加をオープンにすることで、若年層のシビックプライドと新規雇用を創出。"
        ),
        CaseStudy(
            town_name="海士町 (Ama-cho)",
            prefecture="島根県・隠岐諸島 (Shimane)",
            title="「ないものはない」離島高校の全国魅力化プロジェクト",
            summary="人口2,200人の隠岐諸島中ノ島。廃校寸前だった県立隠岐島前高校を全国募集する「地域みらい留学」へ転換。島外・海外から意欲的な高校生が殺到。",
            key_interventions=[
                "隠岐島前高校魅力化プロジェクトと公立塾「隠岐國学習センター」設置",
                "「CAS凍結技術」による隠岐牛・岩ガキの超高鮮度全国ブランド化",
                "町長給与50%カットなど痛みを伴う行財政改革の断行"
            ],
            results_achieved="高校生徒数が2倍以上に増加。20-30代のIターン者が全人口の約20%を占める奇跡の島へ。",
            applicable_lessons="学校の存続を核にした教育魅力化が、最も強力な定住移住のドライバーとなる。"
        )
    ]

@router.get("/digital-nomad-package/{municipality_id}")
def get_digital_nomad_package(municipality_id: str, db: Session = Depends(get_db)):
    muni = db.query(Municipality).filter(Municipality.id == municipality_id).first()
    return {
        "town_name": muni.municipality_name if muni else "南阿蘇村",
        "prefecture": muni.prefecture if muni else "熊本県",
        "tagline": "阿蘇の湧水と大自然に囲まれた、次世代クリエイターのための分散型ワークステーション",
        "perks": [
            {"title": "高速光回線＆電源完備コワーキング", "description": "村内3拠点の古民家ワークスペースを月額¥5,000で使い放題"},
            {"title": "お試し移住シェアハウス", "description": "家具家電付き古民家レジデンス（最大3ヶ月、1泊¥1,500）"},
            {"title": "阿蘇温泉郷フリーパス", "description": "村内5箇所の天然温泉を平日フリーで利用可能なデジタルクーポン"},
            {"title": "地域共創マッチング", "description": "地元農家・クラフトビール醸造所との副業・プロジェクト連携"}
        ],
        "subsidies": [
            {"name": "テレワーク移住支援金", "amount": "最大100万円（単身60万円、世帯100万円）"},
            {"name": "空き家テレワーク拠点改修助成", "amount": "改修費用の2/3（上限150万円）"},
            {"name": "光回線開通初期工事助成", "amount": "全額村負担（0円）"}
        ],
        "coworking_spaces": [
            {"name": "Minamiaso Spring Hub (長野)", "seats": 35, "speed_mbps": 850, "lat": 32.8225, "lon": 131.0130},
            {"name": "Aso Caldera Co-Lab (旧久石小校舎)", "seats": 50, "speed_mbps": 920, "lat": 32.8082, "lon": 131.0365}
        ]
    }
