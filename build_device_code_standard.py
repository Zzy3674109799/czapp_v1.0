from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUT = "设备编码规则标准.docx"


def set_east_asia_font(run, font_name="Microsoft YaHei"):
    run.font.name = font_name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), font_name)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_margins(cell, top=80, bottom=80, start=120, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in {"top": top, "bottom": bottom, "start": start, "end": end}.items():
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_table_width(table, widths):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for row in table.rows:
        for idx, width in enumerate(widths):
            cell = row.cells[idx]
            cell.width = Inches(width)
            set_cell_margins(cell)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER


def add_para(doc, text="", style=None, bold_prefix=None):
    p = doc.add_paragraph(style=style)
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        r1.bold = True
        set_east_asia_font(r1)
        r2 = p.add_run(text[len(bold_prefix):])
        set_east_asia_font(r2)
    else:
        r = p.add_run(text)
        set_east_asia_font(r)
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        r = p.add_run(item)
        set_east_asia_font(r)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        r = p.add_run(item)
        set_east_asia_font(r)


def add_heading(doc, text, level):
    p = doc.add_heading(level=level)
    r = p.add_run(text)
    set_east_asia_font(r)
    return p


def add_table(doc, headers, rows, widths):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    set_table_width(table, widths)
    hdr = table.rows[0].cells
    for i, text in enumerate(headers):
        set_cell_shading(hdr[i], "F2F4F7")
        p = hdr[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        set_east_asia_font(r)
    for row_data in rows:
        row = table.add_row().cells
        for i, text in enumerate(row_data):
            p = row[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(text)
            set_east_asia_font(r)
            set_cell_margins(row[i])
    set_table_width(table, widths)
    return table


def configure_styles(doc):
    section = doc.sections[0]
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Microsoft YaHei"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    normal.font.size = Pt(11)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.1

    for name, size, color, before, after in [
        ("Heading 1", 16, "2E74B5", 16, 8),
        ("Heading 2", 13, "2E74B5", 12, 6),
        ("Heading 3", 12, "1F4D78", 8, 4),
    ]:
        style = styles[name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(size)
        style.font.color.rgb = RGBColor.from_string(color)
        style.font.bold = True
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)

    for name in ["List Bullet", "List Number"]:
        style = styles[name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(11)
        style.paragraph_format.space_after = Pt(4)


def build_doc():
    doc = Document()
    configure_styles(doc)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = title.add_run("设备编码规则标准")
    set_east_asia_font(r)
    r.font.size = Pt(22)
    r.bold = True
    r.font.color.rgb = RGBColor.from_string("0B2545")

    sub = doc.add_paragraph()
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = sub.add_run("适用于深圳、襄阳、枣阳、安陆、武汉、南阳基地设备统一编码与台账管理")
    set_east_asia_font(r)
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor.from_string("555555")

    meta = [
        ("文件编号", "EQ-CODE-STD-001"),
        ("版本", "V1.0"),
        ("编制部门", "设备管理/信息化管理部门"),
        ("适用范围", "总部及各生产基地生产、检测、公辅、环境监测及相关设备"),
        ("生效方式", "经内部审批后执行"),
    ]
    add_table(doc, ["项目", "内容"], meta, [1.5, 5.0])

    add_heading(doc, "1. 目的", 1)
    add_para(doc, "为实现公司各基地设备的统一识别、统一建档、统一查询和全生命周期追溯，规范设备编码生成、使用、变更和维护要求，避免同类设备重复编号、历史设备无序编号、跨基地调拨后编号混乱等问题，特制定本标准。")

    add_heading(doc, "2. 适用范围", 1)
    add_para(doc, "本标准适用于公司深圳、襄阳、枣阳、安陆、武汉、南阳基地范围内的设备编码管理，包括但不限于分容柜、循环柜、测试仪、温湿度设备、充放电设备、老化设备、点焊机、空压机、冷水机、电子秤、夹具/工装及后续新增设备类型。")

    add_heading(doc, "3. 编码原则", 1)
    add_bullets(doc, [
        "唯一性：设备编码在公司范围内唯一，不允许重复。",
        "稳定性：设备调拨、换车间、换产线、换责任人时，设备编码不变，仅更新设备档案中的位置和责任信息。",
        "可读性：编码应能识别公司、基地、设备类别和顺序号。",
        "可扩展性：新增基地、新增设备类别时，通过字典维护扩展，不改变既有设备编码。",
        "系统生成：正式运行后，设备编码原则上由设备台账系统自动生成，人工不得随意占号、跳号、改号。",
    ])

    add_heading(doc, "4. 设备编码结构", 1)
    add_para(doc, "考虑历史设备采购年份不完整、补录维护难度高，本标准不使用年份作为主编码段。推荐设备主编码结构如下：")
    callout = add_table(doc, ["编码结构", "说明"], [
        ("公司代码-基地代码-设备类别代码-五位流水号", "示例：ST-SZ-FCG-00001"),
    ], [2.5, 4.0])
    for cell in callout.rows[1].cells:
        set_cell_shading(cell, "F4F6F9")
    add_para(doc, "说明：公司代码由公司正式确定，本文示例使用 ST。正式发布前可替换为企业英文简称或集团统一代码。")

    add_table(doc, ["段位", "长度/格式", "示例", "定义"], [
        ("公司代码", "2-4 位大写字母", "ST", "代表公司或集团，用于公司级唯一识别。"),
        ("基地代码", "2-3 位大写字母", "SZ", "代表设备初始建档基地。"),
        ("设备类别代码", "3 位大写字母", "FCG", "代表设备大类，由设备类别字典统一维护。"),
        ("流水号", "5 位数字", "00001", "同一基地、同一设备类别下连续生成，不因年份变化而重置。"),
    ], [1.1, 1.4, 1.0, 4.0])

    add_heading(doc, "5. 基地代码字典", 1)
    add_table(doc, ["基地", "基地代码", "编码示例"], [
        ("深圳基地", "SZ", "ST-SZ-FCG-00001"),
        ("襄阳基地", "XY", "ST-XY-FCG-00001"),
        ("枣阳基地", "ZY", "ST-ZY-FCG-00001"),
        ("安陆基地", "AL", "ST-AL-FCG-00001"),
        ("武汉基地", "WH", "ST-WH-FCG-00001"),
        ("南阳基地", "NY", "ST-NY-FCG-00001"),
    ], [1.7, 1.2, 3.6])

    add_heading(doc, "6. 设备类别代码字典", 1)
    add_para(doc, "设备类别代码采用 3 位大写字母，优先使用中文拼音首字母组合；若存在冲突，由设备管理部门统一调整并登记。")
    add_table(doc, ["设备类型", "类别代码", "说明"], [
        ("分容柜", "FCG", "用于电芯分容、容量测试相关设备。"),
        ("循环柜", "XHG", "用于循环充放电、循环测试相关设备。"),
        ("测试仪", "CSY", "用于参数检测、功能测试、性能测试等仪器。"),
        ("温湿度设备", "WSD", "用于温湿度监测、记录、控制相关设备。"),
        ("充放电设备", "CFD", "用于充电、放电或充放电一体设备。"),
        ("老化设备", "LHS", "用于老化、稳定性验证相关设备。"),
        ("点焊机", "DHJ", "用于点焊、焊接工序设备。"),
        ("空压机", "KYJ", "用于压缩空气供应设备。"),
        ("冷水机", "LSJ", "用于冷却水供应或温控设备。"),
        ("电子秤", "DCS", "用于称重、计量相关设备。"),
        ("夹具/工装", "GZJ", "用于生产、测试、装配辅助工装。"),
        ("其他设备", "QTS", "暂未纳入标准类别的设备，使用前须审批。"),
    ], [1.6, 1.0, 3.9])

    add_heading(doc, "7. 编码生成规则", 1)
    add_numbered(doc, [
        "设备首次建档时生成设备编码，生成后不得随意修改。",
        "流水号按“基地代码 + 设备类别代码”维度连续取号，不按年份重置。",
        "历史设备集中盘点时，按现场盘点确认顺序或设备台账排序批量生成编码。",
        "新增设备入厂后，由设备管理人员在台账系统中录入基础信息，系统自动生成下一个可用流水号。",
        "报废设备的编码不得重复使用；编码永久保留在历史档案中。",
    ])
    add_para(doc, "示例：深圳基地已有分容柜最大编码为 ST-SZ-FCG-00086，下一台深圳分容柜自动生成 ST-SZ-FCG-00087。")

    add_heading(doc, "8. 历史设备补码规则", 1)
    add_para(doc, "针对历史设备采购年份、入厂年份不完整的情况，统一采用“无年份主编码”。补码时不追溯年份，不以财务入账年份或设备铭牌年份作为编码段，避免后续维护困难。")
    add_bullets(doc, [
        "已知设备：按基地、设备类别分组后，从 00001 开始连续编号。",
        "信息不完整设备：先生成设备编码，同时在台账中标记“资料待补充”。",
        "同一设备存在多个旧编号：保留旧编号为“历史编号/资产编号/厂家序列号”，主设备编码只保留一个。",
        "无法确认类别的设备：暂列“其他设备 QTS”，确认类别后可在建档初期重新归类；正式上线后不建议改主编码。",
    ])

    add_heading(doc, "9. 设备编码示例", 1)
    add_table(doc, ["设备编码", "含义"], [
        ("ST-SZ-FCG-00001", "深圳基地第 1 台分容柜。"),
        ("ST-XY-XHG-00015", "襄阳基地第 15 台循环柜。"),
        ("ST-ZY-CSY-00008", "枣阳基地第 8 台测试仪。"),
        ("ST-AL-WSD-00003", "安陆基地第 3 台温湿度设备。"),
        ("ST-WH-CFD-00022", "武汉基地第 22 台充放电设备。"),
        ("ST-NY-LHS-00006", "南阳基地第 6 台老化设备。"),
    ], [2.0, 4.5])

    add_heading(doc, "10. 设备档案字段要求", 1)
    add_para(doc, "设备编码只解决唯一身份识别，设备位置、状态、责任部门等变动信息不得写入主编码，应在设备档案中维护。")
    add_table(doc, ["字段", "是否必填", "说明"], [
        ("设备编码", "是", "按本标准生成的唯一编码。"),
        ("设备名称", "是", "例如分容柜、循环柜、测试仪。"),
        ("设备类别", "是", "对应设备类别代码字典。"),
        ("所属基地", "是", "当前管理基地。"),
        ("当前车间/区域", "是", "设备实际所在车间、楼层、区域。"),
        ("当前产线/工位", "建议", "用于现场定位和扫码点检。"),
        ("设备状态", "是", "待安装、调试中、在用、闲置、维修中、停用、调拨中、报废等。"),
        ("责任部门/责任人", "是", "设备日常管理责任归属。"),
        ("厂家/品牌", "建议", "用于维保和供应商追溯。"),
        ("型号规格", "建议", "设备技术规格。"),
        ("厂家序列号", "建议", "设备铭牌或厂家 SN。"),
        ("资产编号", "建议", "财务固定资产编号，与设备编码分开维护。"),
        ("入厂/建档日期", "建议", "历史设备不知道入厂日期时可填建档日期。"),
        ("保养周期/校准周期", "按需", "用于点检、保养、校准计划。"),
    ], [1.6, 1.0, 3.9])

    add_heading(doc, "11. 标签与扫码要求", 1)
    add_bullets(doc, [
        "每台设备应粘贴二维码或条码标签，标签内容至少包含设备编码、设备名称、所属基地。",
        "二维码内容建议使用设备系统详情页链接，例如：https://ems.company.com/device/ST-SZ-FCG-00001。",
        "现场标签应耐磨、防油污、防潮，必要时使用金属铭牌或覆膜标签。",
        "扫码后应能查看设备档案、点检记录、保养记录、维修记录、校准记录和调拨记录。",
    ])

    add_heading(doc, "12. 变更与维护要求", 1)
    add_table(doc, ["场景", "设备编码是否变化", "处理要求"], [
        ("同基地内换车间/换产线", "不变", "更新当前车间、产线、责任人。"),
        ("跨基地调拨", "原则上不变", "保留原编码，更新所属基地和调拨记录；如公司要求按新基地重新编码，须保留原编码为历史编码并审批。"),
        ("设备改造升级", "不变", "更新型号、配置、改造记录。"),
        ("设备拆分", "视情况", "主体设备保留原编码，拆出的可独立管理设备重新建档编码。"),
        ("设备合并", "视情况", "保留主设备编码，其他编码转入历史关联记录。"),
        ("设备报废", "不变且不复用", "状态改为报废，编码永久封存。"),
    ], [1.9, 1.5, 3.1])

    add_heading(doc, "13. 职责分工", 1)
    add_table(doc, ["角色/部门", "主要职责"], [
        ("设备管理部门", "维护设备类别字典，审核编码规则执行，组织历史设备盘点和标签张贴。"),
        ("各基地设备负责人", "负责本基地设备建档、补码、状态维护、调拨和报废信息更新。"),
        ("信息化部门", "负责台账系统、编码自动生成逻辑、二维码链接和权限配置。"),
        ("财务/资产管理部门", "负责固定资产编号维护，并与设备编码建立关联关系。"),
        ("使用部门", "负责现场设备信息确认、标签保护、扫码点检和异常反馈。"),
    ], [1.8, 4.7])

    add_heading(doc, "14. 实施步骤", 1)
    add_numbered(doc, [
        "确认公司代码和本标准中的基地代码、设备类别代码。",
        "各基地按设备类型完成现场盘点，形成设备清单。",
        "设备管理部门按“基地 + 类别”分组生成历史设备编码。",
        "信息化部门导入设备台账，启用自动取号规则。",
        "打印并张贴二维码/条码标签。",
        "组织现场扫码核验，发现重码、漏码、错码及时修正。",
        "正式上线后，新增设备必须先建档再使用。",
    ])

    add_heading(doc, "15. 附则", 1)
    add_bullets(doc, [
        "本标准发布后，原有现场手写编号、临时编号、部门自编编号不得作为主设备编码继续新增使用。",
        "本标准未覆盖的新设备类别，由设备管理部门提出类别代码，经审批后纳入字典。",
        "本标准由设备管理部门负责解释，信息化部门配合系统实现。",
    ])

    footer = doc.sections[0].footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = footer.add_run("设备编码规则标准 | 第 ")
    set_east_asia_font(r)
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.text = "PAGE"
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    footer._p.append(fld_char1)
    footer._p.append(instr)
    footer._p.append(fld_char2)
    r = footer.add_run(" 页")
    set_east_asia_font(r)

    doc.save(OUT)


if __name__ == "__main__":
    build_doc()
