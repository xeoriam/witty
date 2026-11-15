/* mammoth 1.13.0 browser bundle; BSD-2-Clause, see vendor/LICENSE.mammoth */
!function(f){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=f();else if("function"==typeof define&&define.amd)define([],f);else{var g;g="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,g.mammoth=f()}}(function(){var define;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a="function"==typeof require&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}for(var i="function"==typeof require&&require,o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){function Files(){function read(uri){return promises.reject(new Error("could not open external image: '"+uri+"'\ncannot open linked files from a web browser"))}return{read:read}}var promises=require("../../lib/promises");exports.Files=Files},{"../../lib/promises":23}],2:[function(require,module,exports){function openZip(options){return options.arrayBuffer?promises.resolve(zipfile.openArrayBuffer(options.arrayBuffer)):promises.reject(new Error("Could not find file in options"))}var promises=require("../lib/promises"),zipfile=require("../lib/zipfile");exports.openZip=openZip},{"../lib/promises":23,"../lib/zipfile":40}],3:[function(require,module,exports){function DocumentConverter(options){return{convertToHtml:function(element){var comments=_.indexBy(element.type===documents.types.document?element.comments:[],"commentId"),conversion=new DocumentConversion(options,comments);return conversion.convertToHtml(element)}}}function DocumentConversion(options,comments){function convertToHtml(document){var messages=[],html=elementToHtml(document,messages,Object.create(null)),deferredNodes=[];walkHtml(html,function(node){"deferred"===node.type&&deferredNodes.push(node)});var deferredValues=Object.create(null);return promises.forEachSeries(deferredNodes,function(deferred){return deferred.value().then(function(value){deferredValues[deferred.id]=value})}).then(function(){function replaceDeferred(nodes){return flatMap(nodes,function(node){return"deferred"===node.type?deferredValues[node.id]:node.children?[_.extend({},node,{children:replaceDeferred(node.children)})]:[node]})}var writer=writers.writer({prettyPrint:options.prettyPrint,outputFormat:options.outputFormat});return Html.write(writer,Html.simplify(replaceDeferred(html))),new results.Result(writer.asString(),messages)})}function convertElements(elements,messages,context){return flatMap(elements,function(element){return elementToHtml(element,messages,context)})}function elementToHtml(element,messages,context){if(!context)throw new Error("context not set");var handler=elementConverters[element.type];return handler?handler(element,messages,context):[]}function convertParagraph(element,messages,context){return htmlPathForParagraph(element,messages).wrap(function(){var content=convertElements(element.children,messages,context);return ignoreEmptyParagraphs?content:[Html.forceWrite].concat(content)})}function htmlPathForParagraph(element,messages){var style=findStyle(element);return style?style.to:(element.styleId&&messages.push(unrecognisedStyleWarning("paragraph",element)),defaultParagraphStyle)}function convertRun(run,messages,context){var nodes=function(){return convertElements(run.children,messages,context)},paths=[];if(null!==run.highlight){var path=findHtmlPath({type:"highlight",color:run.highlight});path&&paths.push(path)}run.isSmallCaps&&paths.push(findHtmlPathForRunProperty("smallCaps")),run.isAllCaps&&paths.push(findHtmlPathForRunProperty("allCaps")),run.isStrikethrough&&paths.push(findHtmlPathForRunProperty("strikethrough","s")),run.isUnderline&&paths.push(findHtmlPathForRunProperty("underline")),run.verticalAlignment===documents.verticalAlignment.subscript&&paths.push(htmlPaths.element("sub",{},{fresh:!1})),run.verticalAlignment===documents.verticalAlignment.superscript&&paths.push(htmlPaths.element("sup",{},{fresh:!1})),run.isItalic&&paths.push(findHtmlPathForRunProperty("italic","em")),run.isBold&&paths.push(findHtmlPathForRunProperty("bold","strong"));var stylePath=htmlPaths.empty,style=findStyle(run);return style?stylePath=style.to:run.styleId&&messages.push(unrecognisedStyleWarning("run",run)),paths.push(stylePath),paths.forEach(function(path){nodes=path.wrap.bind(path,nodes)}),nodes()}function findHtmlPathForRunProperty(elementType,defaultTagName){var path=findHtmlPath({type:elementType});return path?path:defaultTagName?htmlPaths.element(defaultTagName,{},{fresh:!1}):htmlPaths.empty}function findHtmlPath(element,defaultPath){var style=findStyle(element);return style?style.to:defaultPath}function findStyle(element){for(var i=0;i<styleMap.length;i++)if(styleMap[i].from.matches(element))return styleMap[i]}function recoveringConvertImage(convertImage){return function(image,messages){return promises["try"](function(){return convertImage(image,messages)})["catch"](function(error){return messages.push(results.error(error)),[]})}}function noteHtmlId(note){return referentHtmlId(note.noteType,note.noteId)}function noteRefHtmlId(note){return referenceHtmlId(note.noteType,note.noteId)}function referentHtmlId(referenceType,referenceId){return htmlId(referenceType+"-"+referenceId)}function referenceHtmlId(referenceType,referenceId){return htmlId(referenceType+"-ref-"+referenceId)}function htmlId(suffix){return idPrefix+suffix}function convertTable(element,messages,context){return findHtmlPath(element,defaultTablePath).wrap(function(){return convertTableChildren(element,messages,context)})}function convertTableChildren(element,messages,context){var bodyIndex=_.findIndex(element.children,function(child){return!child.type===documents.types.tableRow||!child.isHeader});-1===bodyIndex&&(bodyIndex=element.children.length);var children;if(0===bodyIndex)children=convertElements(element.children,messages,_.extend({},context,{isTableHeader:!1}));else{var headRows=convertElements(element.children.slice(0,bodyIndex),messages,_.extend({},context,{isTableHeader:!0})),bodyRows=convertElements(element.children.slice(bodyIndex),messages,_.extend({},context,{isTableHeader:!1}));children=[Html.freshElement("thead",{},headRows),Html.freshElement("tbody",{},bodyRows)]}return[Html.forceWrite].concat(children)}function convertTableRow(element,messages,context){var children=convertElements(element.children,messages,context);return[Html.freshElement("tr",{},[Html.forceWrite].concat(children))]}function convertTableCell(element,messages,context){var tagName=context.isTableHeader?"th":"td",children=convertElements(element.children,messages,context),attributes={};return 1!==element.colSpan&&(attributes.colspan=element.colSpan.toString()),1!==element.rowSpan&&(attributes.rowspan=element.rowSpan.toString()),[Html.freshElement(tagName,attributes,[Html.forceWrite].concat(children))]}function convertCommentReference(reference,messages,context){return findHtmlPath(reference,htmlPaths.ignore).wrap(function(){var comment=comments[reference.commentId],count=referencedComments.length+1,label="["+commentAuthorLabel(comment)+count+"]";return referencedComments.push({label:label,comment:comment}),[Html.freshElement("a",{href:"#"+referentHtmlId("comment",reference.commentId),id:referenceHtmlId("comment",reference.commentId)},[Html.text(label)])]})}function convertComment(referencedComment,messages,context){var label=referencedComment.label,comment=referencedComment.comment,body=convertElements(comment.body,messages,context).concat([Html.nonFreshElement("p",{},[Html.text(" "),Html.freshElement("a",{href:"#"+referenceHtmlId("comment",comment.commentId)},[Html.text("↑")])])]);return[Html.freshElement("dt",{id:referentHtmlId("comment",comment.commentId)},[Html.text("Comment "+label)]),Html.freshElement("dd",{},body)]}function convertBreak(element,messages,context){return htmlPathForBreak(element).wrap(function(){return[]})}function htmlPathForBreak(element){var style=findStyle(element);return style?style.to:"line"===element.breakType?htmlPaths.topLevelElement("br"):htmlPaths.empty}var noteNumber=1,noteReferences=[],referencedComments=[];options=_.extend({ignoreEmptyParagraphs:!0},options);var idPrefix=void 0===options.idPrefix?"":options.idPrefix,ignoreEmptyParagraphs=options.ignoreEmptyParagraphs,defaultParagraphStyle=htmlPaths.topLevelElement("p"),styleMap=options.styleMap||[],defaultTablePath=htmlPaths.elements([htmlPaths.element("table",{},{fresh:!0})]),elementConverters={document:function(document,messages,context){var children=convertElements(document.children,messages,context),notes=noteReferences.map(function(noteReference){return document.notes.resolve(noteReference)}),notesNodes=convertElements(notes,messages,context);return children.concat([Html.freshElement("ol",{},notesNodes),Html.freshElement("dl",{},flatMap(referencedComments,function(referencedComment){return convertComment(referencedComment,messages,context)}))])},paragraph:convertParagraph,run:convertRun,text:function(element,messages,context){return[Html.text(element.value)]},tab:function(element,messages,context){return[Html.text("	")]},hyperlink:function(element,messages,context){var href=element.anchor?"#"+htmlId(element.anchor):element.href,attributes={href:href};null!=element.targetFrame&&(attributes.target=element.targetFrame);var children=convertElements(element.children,messages,context);return[Html.nonFreshElement("a",attributes,children)]},checkbox:function(element){var attributes={type:"checkbox"};return element.checked&&(attributes.checked="checked"),[Html.freshElement("input",attributes)]},bookmarkStart:function(element,messages,context){var anchor=Html.freshElement("a",{id:htmlId(element.name)},[Html.forceWrite]);return[anchor]},noteReference:function(element,messages,context){noteReferences.push(element);var anchor=Html.freshElement("a",{href:"#"+noteHtmlId(element),id:noteRefHtmlId(element)},[Html.text("["+noteNumber++ +"]")]);return[Html.freshElement("sup",{},[anchor])]},note:function(element,messages,context){var children=convertElements(element.body,messages,context),backLink=Html.elementWithTag(htmlPaths.element("p",{},{fresh:!1}),[Html.text(" "),Html.freshElement("a",{href:"#"+noteRefHtmlId(element)},[Html.text("↑")])]),body=children.concat([backLink]);return Html.freshElement("li",{id:noteHtmlId(element)},body)},commentReference:convertCommentReference,comment:convertComment,image:deferredConversion(recoveringConvertImage(options.convertImage||images.dataUri)),table:convertTable,tableRow:convertTableRow,tableCell:convertTableCell,"break":convertBreak};return{convertToHtml:convertToHtml}}function deferredConversion(func){return function(element,messages,context){return[{type:"deferred",id:deferredId++,value:function(){return func(element,messages,context)}}]}}function unrecognisedStyleWarning(type,element){return results.warning("Unrecognised "+type+" style: '"+element.styleName+"' (Style ID: "+element.styleId+")")}function flatMap(values,func){return _.flatten(values.map(func),!0)}function walkHtml(nodes,callback){nodes.forEach(function(node){callback(node),node.children&&walkHtml(node.children,callback)})}var _=require("underscore"),promises=require("./promises"),documents=require("./documents"),htmlPaths=require("./styles/html-paths"),results=require("./results"),images=require("./images"),Html=require("./html"),writers=require("./writers");exports.DocumentConverter=DocumentConverter;var deferredId=1,commentAuthorLabel=exports.commentAuthorLabel=function(comment){return comment.authorInitials||""}},{"./documents":4,"./html":18,"./images":20,"./promises":23,"./results":25,"./styles/html-paths":28,"./writers":33,underscore:67}],4:[function(require,module,exports){(function(Buffer){function Document(children,options){return options=options||{},{type:types.document,children:children,notes:options.notes||new Notes({}),comments:options.comments||[]}}function Paragraph(children,properties){properties=properties||{};var indent=properties.indent||{};return{type:types.paragraph,children:children,styleId:properties.styleId||null,styleName:properties.styleName||null,numbering:properties.numbering||null,alignment:properties.alignment||null,indent:{start:indent.start||null,end:indent.end||null,firstLine:indent.firstLine||null,hanging:indent.hanging||null}}}function Run(children,properties){return properties=properties||{},{type:types.run,children:children,styleId:properties.styleId||null,styleName:properties.styleName||null,isBold:!!properties.isBold,isUnderline:!!properties.isUnderline,isItalic:!!properties.isItalic,isStrikethrough:!!properties.isStrikethrough,isAllCaps:!!properties.isAllCaps,isSmallCaps:!!properties.isSmallCaps,verticalAlignment:properties.verticalAlignment||verticalAlignment.baseline,font:properties.font||null,fontSize:properties.fontSize||null,highlight:properties.highlight||null}}function Text(value){return{type:types.text,value:value}}function Tab(){return{type:types.tab}}function Checkbox(options){return{type:types.checkbox,checked:options.checked}}function Hyperlink(children,options){return{type:types.hyperlink,children:children,href:options.href,anchor:options.anchor,targetFrame:options.targetFrame}}function NoteReference(options){return{type:types.noteReference,noteType:options.noteType,noteId:options.noteId}}function Notes(notes){this._notes=_.indexBy(notes,function(note){return noteKey(note.noteType,note.noteId)})}function Note(options){return{type:types.note,noteType:options.noteType,noteId:options.noteId,body:options.body}}function commentReference(options){return{type:types.commentReference,commentId:options.commentId}}function comment(options){return{type:types.comment,commentId:options.commentId,body:options.body,authorName:options.authorName,authorInitials:options.authorInitials}}function noteKey(noteType,id){return noteType+"-"+id}function Image(options){return{type:types.image,read:function(encoding){return encoding?options.readImage(encoding):options.readImage().then(function(arrayBuffer){return Buffer.from(arrayBuffer)})},readAsArrayBuffer:function(){return options.readImage()},readAsBase64String:function(){return options.readImage("base64")},readAsBuffer:function(){return options.readImage().then(function(arrayBuffer){return Buffer.from(arrayBuffer)})},altText:options.altText,contentType:options.contentType}}function Table(children,properties){return properties=properties||{},{type:types.table,children:children,styleId:properties.styleId||null,styleName:properties.styleName||null}}function TableRow(children,options){return options=options||{},{type:types.tableRow,children:children,isHeader:options.isHeader||!1}}function TableCell(children,options){return options=options||{},{type:types.tableCell,children:children,colSpan:null==options.colSpan?1:options.colSpan,rowSpan:null==options.rowSpan?1:options.rowSpan}}function Break(breakType){return{type:types["break"],breakType:breakType}}function BookmarkStart(options){return{type:types.bookmarkStart,name:options.name}}var _=require("underscore"),types=exports.types={document:"document",paragraph:"paragraph",run:"run",text:"text",tab:"tab",checkbox:"checkbox",hyperlink:"hyperlink",noteReference:"noteReference",image:"image",note:"note",commentReference:"commentReference",comment:"comment",table:"table",tableRow:"tableRow",tableCell:"tableCell","break":"break",bookmarkStart:"bookmarkStart"},verticalAlignment={baseline:"baseline",superscript:"superscript",subscript:"subscript"};Notes.prototype.resolve=function(reference){return this.findNoteByKey(noteKey(reference.noteType,reference.noteId))},Notes.prototype.findNoteByKey=function(key){return this._notes[key]||null},exports.document=exports.Document=Document,exports.paragraph=exports.Paragraph=Paragraph,exports.run=exports.Run=Run,exports.text=exports.Text=Text,exports.tab=exports.Tab=Tab,exports.checkbox=exports.Checkbox=Checkbox,exports.Hyperlink=Hyperlink,exports.noteReference=exports.NoteReference=NoteReference,exports.Notes=Notes,exports.Note=Note,exports.commentReference=commentReference,exports.comment=comment,exports.Image=Image,exports.Table=Table,exports.TableRow=TableRow,exports.TableCell=TableCell,exports.lineBreak=Break("line"),exports.pageBreak=Break("page"),exports.columnBreak=Break("column"),exports.BookmarkStart=BookmarkStart,exports.verticalAlignment=verticalAlignment}).call(this,require("buffer").Buffer)},{buffer:48,underscore:67}],5:[function(require,module,exports){function createBodyReader(options){return{readXmlElement:function(element){return new BodyReader(options).readXmlElement(element)},readXmlElements:function(elements){return new BodyReader(options).readXmlElements(elements)}}}function BodyReader(options){function readXmlElements(elements){var results=elements.map(readXmlElement);return combineResults(results)}function readXmlElement(element){if("element"===element.type){var handler=xmlElementReaders[element.name];if(handler)return handler(element);if(!Object.prototype.hasOwnProperty.call(ignoreElements,element.name)){var message=warning("An unrecognised element was ignored: "+element.name);return emptyResultWithMessages([message])}}return emptyResult()}function readParagraphProperties(element){return readParagraphStyle(element).map(function(style){return{type:"paragraphProperties",styleId:style.styleId,styleName:style.name,alignment:element.firstOrEmpty("w:jc").attributes["w:val"],numbering:readNumberingProperties(style.styleId,element.firstOrEmpty("w:numPr"),numbering),indent:readParagraphIndent(element.firstOrEmpty("w:ind"))}})}function readParagraphIndent(element){return{start:element.attributes["w:start"]||element.attributes["w:left"],end:element.attributes["w:end"]||element.attributes["w:right"],firstLine:element.attributes["w:firstLine"],hanging:element.attributes["w:hanging"]}}function readRunProperties(element){return readRunStyle(element).map(function(style){var fontSizeString=element.firstOrEmpty("w:sz").attributes["w:val"],fontSize=/^[0-9]+$/.test(fontSizeString)?parseInt(fontSizeString,10)/2:null;return{type:"runProperties",styleId:style.styleId,styleName:style.name,verticalAlignment:element.firstOrEmpty("w:vertAlign").attributes["w:val"],font:element.firstOrEmpty("w:rFonts").attributes["w:ascii"],fontSize:fontSize,isBold:readBooleanElement(element.first("w:b")),isUnderline:readUnderline(element.first("w:u")),isItalic:readBooleanElement(element.first("w:i")),isStrikethrough:readBooleanElement(element.first("w:strike")),isAllCaps:readBooleanElement(element.first("w:caps")),isSmallCaps:readBooleanElement(element.first("w:smallCaps")),highlight:readHighlightValue(element.firstOrEmpty("w:highlight").attributes["w:val"])}})}function readUnderline(element){if(element){var value=element.attributes["w:val"];return void 0!==value&&"false"!==value&&"0"!==value&&"none"!==value}return!1}function readBooleanElement(element){if(element){var value=element.attributes["w:val"];return"false"!==value&&"0"!==value}return!1}function readBooleanAttributeValue(value){return"false"!==value&&"0"!==value}function readHighlightValue(value){return value&&"none"!==value?value:null}function readParagraphStyle(element){return readStyle(element,"w:pStyle","Paragraph",styles.findParagraphStyleById)}function readRunStyle(element){return readStyle(element,"w:rStyle","Run",styles.findCharacterStyleById)}function readTableStyle(element){return readStyle(element,"w:tblStyle","Table",styles.findTableStyleById)}function readStyle(element,styleTagName,styleType,findStyleById){var messages=[],styleElement=element.first(styleTagName),styleId=null,name=null;if(styleElement&&(styleId=styleElement.attributes["w:val"])){var style=findStyleById(styleId);style?name=style.name:messages.push(undefinedStyleWarning(styleType,styleId))}return elementResultWithMessages({styleId:styleId,name:name},messages)}function readFldChar(element){var type=element.attributes["w:fldCharType"];if("begin"===type)complexFieldStack.push({type:"begin",fldChar:element}),currentInstrText=[];else if("end"===type){if(0===complexFieldStack.length)return emptyResultWithMessages([warning("Ignoring complex field end character without corresponding start character")]);var complexFieldEnd=complexFieldStack.pop();if("begin"===complexFieldEnd.type&&(complexFieldEnd=parseCurrentInstrText(complexFieldEnd)),"checkbox"===complexFieldEnd.type)return elementResult(documents.checkbox({checked:complexFieldEnd.checked}))}else if("separate"===type){if(0===complexFieldStack.length)return emptyResultWithMessages([warning("Ignoring complex field separator character without corresponding start character")]);var complexFieldSeparate=complexFieldStack.pop(),complexField=parseCurrentInstrText(complexFieldSeparate);complexFieldStack.push(complexField)}return emptyResult()}function currentHyperlinkOptions(){var topHyperlink=_.last(complexFieldStack.filter(function(complexField){return"hyperlink"===complexField.type}));return topHyperlink?topHyperlink.options:null}function parseCurrentInstrText(complexField){return parseInstrText(currentInstrText.join(""),"begin"===complexField.type?complexField.fldChar:xml.emptyElement)}function parseInstrText(instrText,fldChar){var linkResult=/^\s*HYPERLINK\s+(\\l\s+)?(?:"(.*)"|([^\\]\S*))/.exec(instrText);if(linkResult){var location=void 0===linkResult[2]?linkResult[3]:linkResult[2],options=void 0===linkResult[1]?{href:location}:{anchor:location};return{type:"hyperlink",options:options}}var checkboxResult=/\s*FORMCHECKBOX\s*/.exec(instrText);if(checkboxResult){var checkboxElement=fldChar.firstOrEmpty("w:ffData").firstOrEmpty("w:checkBox"),checkedElement=checkboxElement.first("w:checked"),checked=readBooleanElement(null==checkedElement?checkboxElement.first("w:default"):checkedElement);return{type:"checkbox",checked:checked}}return{type:"unknown"}}function readInstrText(element){return currentInstrText.push(element.text()),emptyResult()}function readSymbol(element){var font=element.attributes["w:font"],char=element.attributes["w:char"],unicodeCharacter=dingbatToUnicode.hex(font,char);return null==unicodeCharacter&&/^F0..$/.test(char)&&(unicodeCharacter=dingbatToUnicode.hex(font,char.substring(2))),null==unicodeCharacter?emptyResultWithMessages([warning("A w:sym element with an unsupported character was ignored: char "+char+" in font "+font)]):elementResult(new documents.Text(unicodeCharacter.string))}function noteReferenceReader(noteType){return function(element){var noteId=element.attributes["w:id"];return elementResult(new documents.NoteReference({noteType:noteType,noteId:noteId}))}}function readCommentReference(element){return elementResult(documents.commentReference({commentId:element.attributes["w:id"]}))}function readChildElements(element){return readXmlElements(element.children)}function readTable(element){var propertiesResult=readTableProperties(element.firstOrEmpty("w:tblPr"));return readXmlElements(element.children).flatMap(calculateRowSpans).flatMap(function(children){return propertiesResult.map(function(properties){return documents.Table(children,properties)})})}function readTableProperties(element){return readTableStyle(element).map(function(style){return{styleId:style.styleId,styleName:style.name}})}function readTableRow(element){var properties=element.firstOrEmpty("w:trPr"),isDeleted=!!properties.first("w:del");if(isDeleted)return emptyResult();var isHeader=!!properties.first("w:tblHeader");return readXmlElements(element.children).map(function(children){return documents.TableRow(children,{isHeader:isHeader})})}function readTableCell(element){return readXmlElements(element.children).map(function(children){var properties=element.firstOrEmpty("w:tcPr"),gridSpan=properties.firstOrEmpty("w:gridSpan").attributes["w:val"],colSpan=gridSpan?parseInt(gridSpan,10):1,cell=documents.TableCell(children,{colSpan:colSpan});return cell._vMerge=readVMerge(properties),cell})}function readVMerge(properties){var element=properties.first("w:vMerge");if(element){var val=element.attributes["w:val"];return"continue"===val||!val}return null}function calculateRowSpans(rows){var unexpectedNonRows=_.any(rows,function(row){return row.type!==documents.types.tableRow});if(unexpectedNonRows)return removeVMergeProperties(rows),elementResultWithMessages(rows,[warning("unexpected non-row element in table, cell merging may be incorrect")]);var unexpectedNonCells=_.any(rows,function(row){return _.any(row.children,function(cell){return cell.type!==documents.types.tableCell})});if(unexpectedNonCells)return removeVMergeProperties(rows),elementResultWithMessages(rows,[warning("unexpected non-cell element in table row, cell merging may be incorrect")]);var columns={};return rows.forEach(function(row){var cellIndex=0;row.children.forEach(function(cell){cell._vMerge&&columns[cellIndex]?columns[cellIndex].rowSpan++:(columns[cellIndex]=cell,cell._vMerge=!1),cellIndex+=cell.colSpan})}),rows.forEach(function(row){row.children=row.children.filter(function(cell){return!cell._vMerge}),row.children.forEach(function(cell){delete cell._vMerge})}),elementResult(rows)}function removeVMergeProperties(rows){rows.forEach(function(row){var cells=transforms.getDescendantsOfType(row,documents.types.tableCell);cells.forEach(function(cell){delete cell._vMerge})})}function readDrawingElement(element){var blips=element.getElementsByTagName("a:graphic").getElementsByTagName("a:graphicData").getElementsByTagName("pic:pic").getElementsByTagName("pic:blipFill").getElementsByTagName("a:blip");return combineResults(blips.map(readBlip.bind(null,element)))}function readBlip(element,blip){var propertiesElement=element.firstOrEmpty("wp:docPr"),properties=propertiesElement.attributes,altText=isBlank(properties.descr)?properties.title:properties.descr,blipImageFile=findBlipImageFile(blip);return null===blipImageFile?emptyResultWithMessages([warning("Could not find image file for a:blip element")]):readImage(blipImageFile,altText).map(function(imageElement){var hlinkClickElement=propertiesElement.firstOrEmpty("a:hlinkClick"),relationshipId=hlinkClickElement.attributes["r:id"];if(relationshipId){var href=relationships.findTargetByRelationshipId(relationshipId);return new documents.Hyperlink([imageElement],{href:href})}return imageElement})}function isBlank(value){return null==value||/^\s*$/.test(value)}function findBlipImageFile(blip){var embedRelationshipId=blip.attributes["r:embed"],linkRelationshipId=blip.attributes["r:link"];if(embedRelationshipId)return findEmbeddedImageFile(embedRelationshipId);if(linkRelationshipId){var imagePath=relationships.findTargetByRelationshipId(linkRelationshipId);return{path:imagePath,read:files.read.bind(files,imagePath)}}return null}function readImageData(element){var relationshipId=element.attributes["r:id"];return relationshipId?readImage(findEmbeddedImageFile(relationshipId),element.attributes["o:title"]):emptyResultWithMessages([warning("A v:imagedata element without a relationship ID was ignored")])}function findEmbeddedImageFile(relationshipId){var path=uris.uriToZipEntryName("word",relationships.findTargetByRelationshipId(relationshipId));return{path:path,read:docxFile.read.bind(docxFile,path)}}function readImage(imageFile,altText){var contentType=contentTypes.findContentType(imageFile.path),image=documents.Image({readImage:imageFile.read,altText:altText,contentType:contentType}),warnings=supportedImageTypes[contentType]?[]:warning("Image of type "+contentType+" is unlikely to display in web browsers");return elementResultWithMessages(image,warnings)}function undefinedStyleWarning(type,styleId){return warning(type+" style with ID "+styleId+" was referenced but not defined in the document")}var complexFieldStack=[],currentInstrText=[],deletedParagraphContents=[],relationships=options.relationships,contentTypes=options.contentTypes,docxFile=options.docxFile,files=options.files,numbering=options.numbering,styles=options.styles,xmlElementReaders={"w:p":function(element){var paragraphPropertiesElement=element.firstOrEmpty("w:pPr"),isDeleted=!!paragraphPropertiesElement.firstOrEmpty("w:rPr").first("w:del");if(isDeleted)return element.children.forEach(function(child){deletedParagraphContents.push(child)}),emptyResult();var childrenXml=element.children;return deletedParagraphContents.length>0&&(childrenXml=deletedParagraphContents.concat(childrenXml),deletedParagraphContents=[]),ReadResult.map(readParagraphProperties(paragraphPropertiesElement),readXmlElements(childrenXml),function(properties,children){return new documents.Paragraph(children,properties)}).insertExtra()},"w:r":function(element){return ReadResult.map(readRunProperties(element.firstOrEmpty("w:rPr")),readXmlElements(element.children),function(properties,children){var hyperlinkOptions=currentHyperlinkOptions();return null!==hyperlinkOptions&&(children=[new documents.Hyperlink(children,hyperlinkOptions)]),new documents.Run(children,properties)})},"w:fldChar":readFldChar,"w:instrText":readInstrText,"w:t":function(element){return elementResult(new documents.Text(element.text()))},"w:tab":function(element){return elementResult(new documents.Tab)},"w:noBreakHyphen":function(){return elementResult(new documents.Text("‑"))},"w:softHyphen":function(element){return elementResult(new documents.Text("­"))},"w:sym":readSymbol,"w:hyperlink":function(element){var relationshipId=element.attributes["r:id"],anchor=element.attributes["w:anchor"];return readXmlElements(element.children).map(function(children){function create(options){var targetFrame=element.attributes["w:tgtFrame"]||null;return new documents.Hyperlink(children,_.extend({targetFrame:targetFrame},options))}if(relationshipId){var href=relationships.findTargetByRelationshipId(relationshipId);return anchor&&(href=uris.replaceFragment(href,anchor)),create({href:href})}return anchor?create({anchor:anchor}):children})},"w:tbl":readTable,"w:tr":readTableRow,"w:tc":readTableCell,"w:footnoteReference":noteReferenceReader("footnote"),"w:endnoteReference":noteReferenceReader("endnote"),"w:commentReference":readCommentReference,"w:br":function(element){var breakType=element.attributes["w:type"];return null==breakType||"textWrapping"===breakType?elementResult(documents.lineBreak):"page"===breakType?elementResult(documents.pageBreak):"column"===breakType?elementResult(documents.columnBreak):emptyResultWithMessages([warning("Unsupported break type: "+breakType)])},"w:bookmarkStart":function(element){var name=element.attributes["w:name"];return"_GoBack"===name?emptyResult():elementResult(new documents.BookmarkStart({name:name}))},"mc:AlternateContent":function(element){return readChildElements(element.firstOrEmpty("mc:Fallback"))},"w:sdt":function(element){var contentResult=readXmlElements(element.firstOrEmpty("w:sdtContent").children);return contentResult.map(function(content){var checkbox=element.firstOrEmpty("w:sdtPr").first("wordml:checkbox");if(checkbox){var checkedElement=checkbox.first("wordml:checked"),isChecked=!!checkedElement&&readBooleanAttributeValue(checkedElement.attributes["wordml:val"]),documentCheckbox=documents.checkbox({checked:isChecked}),hasCheckbox=!1,replacedContent=content.map(transforms._elementsOfType(documents.types.text,function(text){return text.value.length>0&&!hasCheckbox?(hasCheckbox=!0,documentCheckbox):text}));return hasCheckbox?replacedContent:documentCheckbox}return content})},"w:customXml":readChildElements,"w:ins":readChildElements,"w:moveFromRangeEnd":readChildElements,"w:moveFromRangeStart":readChildElements,"w:moveTo":readChildElements,"w:moveToRangeEnd":readChildElements,"w:moveToRangeStart":readChildElements,"w:object":readChildElements,"w:smartTag":readChildElements,"w:drawing":readChildElements,"w:pict":function(element){return readChildElements(element).toExtra()},"v:roundrect":readChildElements,"v:shape":readChildElements,"v:textbox":readChildElements,"w:txbxContent":readChildElements,"wp:inline":readDrawingElement,"wp:anchor":readDrawingElement,
"v:imagedata":readImageData,"v:group":readChildElements,"v:rect":readChildElements};return{readXmlElement:readXmlElement,readXmlElements:readXmlElements}}function readNumberingProperties(styleId,element,numbering){var level=element.firstOrEmpty("w:ilvl").attributes["w:val"],numId=element.firstOrEmpty("w:numId").attributes["w:val"];if(void 0!==level&&void 0!==numId)return numbering.findLevel(numId,level);if(null!=styleId){var levelByStyleId=numbering.findLevelByParagraphStyleId(styleId);if(null!=levelByStyleId)return levelByStyleId}return void 0!==numId?numbering.findLevel(numId,"0"):null}function emptyResultWithMessages(messages){return new ReadResult(null,null,messages)}function emptyResult(){return new ReadResult(null)}function elementResult(element){return new ReadResult(element)}function elementResultWithMessages(element,messages){return new ReadResult(element,null,messages)}function ReadResult(element,extra,messages){this.value=element||[],this.extra=extra||[],this._result=new Result({element:this.value,extra:extra},messages),this.messages=this._result.messages}function combineResults(results){var result=Result.combine(_.pluck(results,"_result"));return new ReadResult(_.flatten(_.pluck(result.value,"element")),_.filter(_.flatten(_.pluck(result.value,"extra")),identity),result.messages)}function joinElements(first,second){return _.flatten([first,second])}function identity(value){return value}exports.createBodyReader=createBodyReader,exports._readNumberingProperties=readNumberingProperties;var dingbatToUnicode=require("dingbat-to-unicode"),_=require("underscore"),documents=require("../documents"),Result=require("../results").Result,warning=require("../results").warning,xml=require("../xml"),transforms=require("../transforms"),uris=require("./uris"),supportedImageTypes={"image/png":!0,"image/gif":!0,"image/jpeg":!0,"image/svg+xml":!0,"image/tiff":!0},ignoreElements={"office-word:wrap":!0,"v:shadow":!0,"v:shapetype":!0,"w:annotationRef":!0,"w:bookmarkEnd":!0,"w:sectPr":!0,"w:proofErr":!0,"w:lastRenderedPageBreak":!0,"w:commentRangeStart":!0,"w:commentRangeEnd":!0,"w:del":!0,"w:footnoteRef":!0,"w:endnoteRef":!0,"w:moveFrom":!0,"w:pPr":!0,"w:rPr":!0,"w:tblPr":!0,"w:tblGrid":!0,"w:trPr":!0,"w:tcPr":!0};ReadResult.prototype.toExtra=function(){return new ReadResult(null,joinElements(this.extra,this.value),this.messages)},ReadResult.prototype.insertExtra=function(){var extra=this.extra;return extra&&extra.length?new ReadResult(joinElements(this.value,extra),null,this.messages):this},ReadResult.prototype.map=function(func){var result=this._result.map(function(value){return func(value.element)});return new ReadResult(result.value,this.extra,result.messages)},ReadResult.prototype.flatMap=function(func){var result=this._result.flatMap(function(value){return func(value.element)._result});return new ReadResult(result.value.element,joinElements(this.extra,result.value.extra),result.messages)},ReadResult.map=function(first,second,func){return new ReadResult(func(first.value,second.value),joinElements(first.extra,second.extra),first.messages.concat(second.messages))}},{"../documents":4,"../results":25,"../transforms":30,"../xml":35,"./uris":16,"dingbat-to-unicode":50,underscore:67}],6:[function(require,module,exports){function createCommentsReader(bodyReader){function readCommentsXml(element){return Result.combine(element.getElementsByTagName("w:comment").map(readCommentElement))}function readCommentElement(element){function readOptionalAttribute(name){return(element.attributes[name]||"").trim()||null}var id=element.attributes["w:id"];return bodyReader.readXmlElements(element.children).map(function(body){return documents.comment({commentId:id,body:body,authorName:readOptionalAttribute("w:author"),authorInitials:readOptionalAttribute("w:initials")})})}return readCommentsXml}var documents=require("../documents"),Result=require("../results").Result;exports.createCommentsReader=createCommentsReader},{"../documents":4,"../results":25}],7:[function(require,module,exports){function readContentTypesFromXml(element){var extensionDefaults=Object.create(null),overrides=Object.create(null);return element.children.forEach(function(child){if("content-types:Default"===child.name&&(extensionDefaults[child.attributes.Extension]=child.attributes.ContentType),"content-types:Override"===child.name){var name=child.attributes.PartName;"/"===name.charAt(0)&&(name=name.substring(1)),overrides[name]=child.attributes.ContentType}}),contentTypes(overrides,extensionDefaults)}function contentTypes(overrides,extensionDefaults){return{findContentType:function(path){var overrideContentType=overrides[path];if(overrideContentType)return overrideContentType;var pathParts=path.split("."),extension=pathParts[pathParts.length-1];if(Object.prototype.hasOwnProperty.call(extensionDefaults,extension))return extensionDefaults[extension];var fallback=fallbackContentTypes[extension.toLowerCase()];return fallback?"image/"+fallback:null}}}exports.readContentTypesFromXml=readContentTypesFromXml;var fallbackContentTypes={png:"png",gif:"gif",jpeg:"jpeg",jpg:"jpeg",tif:"tiff",tiff:"tiff",bmp:"bmp"};exports.defaultContentTypes=contentTypes({},{})},{}],8:[function(require,module,exports){function DocumentXmlReader(options){function convertXmlToDocument(element){var body=element.first("w:body");if(null==body)throw new Error("Could not find the body element: are you sure this is a docx file?");var result=bodyReader.readXmlElements(body.children).map(function(children){return new documents.Document(children,{notes:options.notes,comments:options.comments})});return new Result(result.value,result.messages)}var bodyReader=options.bodyReader;return{convertXmlToDocument:convertXmlToDocument}}exports.DocumentXmlReader=DocumentXmlReader;var documents=require("../documents"),Result=require("../results").Result},{"../documents":4,"../results":25}],9:[function(require,module,exports){function read(docxFile,input,options){input=input||{},options=options||{};var files=new Files({externalFileAccess:options.externalFileAccess,relativeToFile:input.path});return promises.props({contentTypes:readContentTypesFromZipFile(docxFile),partPaths:findPartPaths(docxFile),docxFile:docxFile,files:files}).also(function(result){return{styles:readStylesFromZipFile(docxFile,result.partPaths.styles)}}).also(function(result){return{numbering:readNumberingFromZipFile(docxFile,result.partPaths.numbering,result.styles)}}).also(function(result){return{footnotes:readXmlFileWithBody(result.partPaths.footnotes,result,function(bodyReader,xml){return xml?notesReader.createFootnotesReader(bodyReader)(xml):new Result([])}),endnotes:readXmlFileWithBody(result.partPaths.endnotes,result,function(bodyReader,xml){return xml?notesReader.createEndnotesReader(bodyReader)(xml):new Result([])}),comments:readXmlFileWithBody(result.partPaths.comments,result,function(bodyReader,xml){return xml?commentsReader.createCommentsReader(bodyReader)(xml):new Result([])})}}).also(function(result){return{notes:result.footnotes.flatMap(function(footnotes){return result.endnotes.map(function(endnotes){return new documents.Notes(footnotes.concat(endnotes))})})}}).then(function(result){return readXmlFileWithBody(result.partPaths.mainDocument,result,function(bodyReader,xml){return result.notes.flatMap(function(notes){return result.comments.flatMap(function(comments){var reader=new DocumentXmlReader({bodyReader:bodyReader,notes:notes,comments:comments});return reader.convertXmlToDocument(xml)})})})})}function findPartPaths(docxFile){return readPackageRelationships(docxFile).then(function(packageRelationships){var mainDocumentPath=findPartPath({docxFile:docxFile,relationships:packageRelationships,relationshipType:"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",basePath:"",fallbackPath:"word/document.xml"});if(!docxFile.exists(mainDocumentPath))throw new Error("Could not find main document part. Are you sure this is a valid .docx file?");return xmlFileReader({filename:relationshipsFilename(mainDocumentPath),readElement:relationshipsReader.readRelationships,defaultValue:relationshipsReader.defaultValue})(docxFile).then(function(documentRelationships){function findPartRelatedToMainDocument(name){return findPartPath({docxFile:docxFile,relationships:documentRelationships,relationshipType:"http://schemas.openxmlformats.org/officeDocument/2006/relationships/"+name,basePath:zipfile.splitPath(mainDocumentPath).dirname,fallbackPath:"word/"+name+".xml"})}return{mainDocument:mainDocumentPath,comments:findPartRelatedToMainDocument("comments"),endnotes:findPartRelatedToMainDocument("endnotes"),footnotes:findPartRelatedToMainDocument("footnotes"),numbering:findPartRelatedToMainDocument("numbering"),styles:findPartRelatedToMainDocument("styles")}})})}function findPartPath(options){var docxFile=options.docxFile,relationships=options.relationships,relationshipType=options.relationshipType,basePath=options.basePath,fallbackPath=options.fallbackPath,targets=relationships.findTargetsByType(relationshipType),normalisedTargets=targets.map(function(target){return stripPrefix(zipfile.joinPath(basePath,target),"/")}),validTargets=normalisedTargets.filter(function(target){return docxFile.exists(target)});return 0===validTargets.length?fallbackPath:validTargets[0]}function stripPrefix(value,prefix){return value.substring(0,prefix.length)===prefix?value.substring(prefix.length):value}function xmlFileReader(options){return function(zipFile){return readXmlFromZipFile(zipFile,options.filename).then(function(element){return element?options.readElement(element):options.defaultValue})}}function readXmlFileWithBody(filename,options,func){var readRelationshipsFromZipFile=xmlFileReader({filename:relationshipsFilename(filename),readElement:relationshipsReader.readRelationships,defaultValue:relationshipsReader.defaultValue});return readRelationshipsFromZipFile(options.docxFile).then(function(relationships){var bodyReader=new createBodyReader({relationships:relationships,contentTypes:options.contentTypes,docxFile:options.docxFile,numbering:options.numbering,styles:options.styles,files:options.files});return readXmlFromZipFile(options.docxFile,filename).then(function(xml){return func(bodyReader,xml)})})}function relationshipsFilename(filename){var split=zipfile.splitPath(filename);return zipfile.joinPath(split.dirname,"_rels",split.basename+".rels")}function readNumberingFromZipFile(zipFile,path,styles){return xmlFileReader({filename:path,readElement:function(element){return numberingXml.readNumberingXml(element,{styles:styles})},defaultValue:numberingXml.defaultNumbering})(zipFile)}function readStylesFromZipFile(zipFile,path){return xmlFileReader({filename:path,readElement:stylesReader.readStylesXml,defaultValue:stylesReader.defaultStyles})(zipFile)}exports.read=read,exports._findPartPaths=findPartPaths;var promises=require("../promises"),documents=require("../documents"),Result=require("../results").Result,zipfile=require("../zipfile"),readXmlFromZipFile=require("./office-xml-reader").readXmlFromZipFile,createBodyReader=require("./body-reader").createBodyReader,DocumentXmlReader=require("./document-xml-reader").DocumentXmlReader,relationshipsReader=require("./relationships-reader"),contentTypesReader=require("./content-types-reader"),numberingXml=require("./numbering-xml"),stylesReader=require("./styles-reader"),notesReader=require("./notes-reader"),commentsReader=require("./comments-reader"),Files=require("./files").Files,readContentTypesFromZipFile=xmlFileReader({filename:"[Content_Types].xml",readElement:contentTypesReader.readContentTypesFromXml,defaultValue:contentTypesReader.defaultContentTypes}),readPackageRelationships=xmlFileReader({filename:"_rels/.rels",readElement:relationshipsReader.readRelationships,defaultValue:relationshipsReader.defaultValue})},{"../documents":4,"../promises":23,"../results":25,"../zipfile":40,"./body-reader":5,"./comments-reader":6,"./content-types-reader":7,"./document-xml-reader":8,"./files":1,"./notes-reader":10,"./numbering-xml":11,"./office-xml-reader":12,"./relationships-reader":13,"./styles-reader":15}],10:[function(require,module,exports){function createReader(noteType,bodyReader){function readNotesXml(element){return Result.combine(element.getElementsByTagName("w:"+noteType).filter(isFootnoteElement).map(readFootnoteElement))}function isFootnoteElement(element){var type=element.attributes["w:type"];return"continuationSeparator"!==type&&"separator"!==type}function readFootnoteElement(footnoteElement){var id=footnoteElement.attributes["w:id"];return bodyReader.readXmlElements(footnoteElement.children).map(function(body){return documents.Note({noteType:noteType,noteId:id,body:body})})}return readNotesXml}var documents=require("../documents"),Result=require("../results").Result;exports.createFootnotesReader=createReader.bind(this,"footnote"),exports.createEndnotesReader=createReader.bind(this,"endnote")},{"../documents":4,"../results":25}],11:[function(require,module,exports){function Numbering(nums,abstractNums,styles){function findLevel(numId,level){return findLevelWithSeenNumIds(numId,level,Object.create(null))}function findLevelWithSeenNumIds(numId,level,seenNumIds){if(seenNumIds[numId])return null;seenNumIds[numId]=!0;var num=nums[numId];if(!num)return null;var abstractNum=abstractNums[num.abstractNumId];if(abstractNum){if(null==abstractNum.numStyleLink)return abstractNums[num.abstractNumId].levels[level];var style=styles.findNumberingStyleById(abstractNum.numStyleLink);return findLevelWithSeenNumIds(style.numId,level,seenNumIds)}return null}function findLevelByParagraphStyleId(styleId){return levelsByParagraphStyleId[styleId]||null}var allLevels=_.flatten(_.values(abstractNums).map(function(abstractNum){return _.values(abstractNum.levels)})),levelsByParagraphStyleId=_.indexBy(allLevels.filter(function(level){return null!=level.paragraphStyleId}),"paragraphStyleId");return{findLevel:findLevel,findLevelByParagraphStyleId:findLevelByParagraphStyleId}}function readNumberingXml(root,options){if(!options||!options.styles)throw new Error("styles is missing");var abstractNums=readAbstractNums(root),nums=readNums(root,abstractNums);return new Numbering(nums,abstractNums,options.styles)}function readAbstractNums(root){var abstractNums=Object.create(null);return root.getElementsByTagName("w:abstractNum").forEach(function(element){var id=element.attributes["w:abstractNumId"];abstractNums[id]=readAbstractNum(element)}),abstractNums}function readAbstractNum(element){var levels=Object.create(null),levelWithoutIndex=null;element.getElementsByTagName("w:lvl").forEach(function(levelElement){var levelIndex=levelElement.attributes["w:ilvl"],numFmt=levelElement.firstOrEmpty("w:numFmt").attributes["w:val"],isOrdered="bullet"!==numFmt,paragraphStyleId=levelElement.firstOrEmpty("w:pStyle").attributes["w:val"];void 0===levelIndex?levelWithoutIndex={isOrdered:isOrdered,level:"0",paragraphStyleId:paragraphStyleId}:levels[levelIndex]={isOrdered:isOrdered,level:levelIndex,paragraphStyleId:paragraphStyleId}}),null!==levelWithoutIndex&&void 0===levels[levelWithoutIndex.level]&&(levels[levelWithoutIndex.level]=levelWithoutIndex);var numStyleLink=element.firstOrEmpty("w:numStyleLink").attributes["w:val"];return{levels:levels,numStyleLink:numStyleLink}}function readNums(root){var nums=Object.create(null);return root.getElementsByTagName("w:num").forEach(function(element){var numId=element.attributes["w:numId"],abstractNumId=element.first("w:abstractNumId").attributes["w:val"];nums[numId]={abstractNumId:abstractNumId}}),nums}var _=require("underscore");exports.readNumberingXml=readNumberingXml,exports.Numbering=Numbering,exports.defaultNumbering=new Numbering({},{})},{underscore:67}],12:[function(require,module,exports){function read(xmlString){return xml.readString(xmlString,xmlNamespaceMap).then(function(document){return collapseAlternateContent(document)[0]})}function readXmlFromZipFile(docxFile,path){return docxFile.exists(path)?docxFile.read(path,"utf-8").then(stripUtf8Bom).then(read):promises.resolve(null)}function stripUtf8Bom(xmlString){return xmlString.replace(/^\uFEFF/g,"")}function collapseAlternateContent(node){return"element"===node.type?"mc:AlternateContent"===node.name?node.firstOrEmpty("mc:Fallback").children:(node.children=_.flatten(node.children.map(collapseAlternateContent,!0)),[node]):[node]}var _=require("underscore"),promises=require("../promises"),xml=require("../xml");exports.read=read,exports.readXmlFromZipFile=readXmlFromZipFile;var xmlNamespaceMap={"http://schemas.openxmlformats.org/wordprocessingml/2006/main":"w","http://schemas.openxmlformats.org/officeDocument/2006/relationships":"r","http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing":"wp","http://schemas.openxmlformats.org/drawingml/2006/main":"a","http://schemas.openxmlformats.org/drawingml/2006/picture":"pic","http://purl.oclc.org/ooxml/wordprocessingml/main":"w","http://purl.oclc.org/ooxml/officeDocument/relationships":"r","http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing":"wp","http://purl.oclc.org/ooxml/drawingml/main":"a","http://purl.oclc.org/ooxml/drawingml/picture":"pic","http://schemas.openxmlformats.org/package/2006/content-types":"content-types","http://schemas.openxmlformats.org/package/2006/relationships":"relationships","http://schemas.openxmlformats.org/markup-compatibility/2006":"mc","urn:schemas-microsoft-com:vml":"v","urn:schemas-microsoft-com:office:word":"office-word","http://schemas.microsoft.com/office/word/2010/wordml":"wordml"}},{"../promises":23,"../xml":35,underscore:67}],13:[function(require,module,exports){function readRelationships(element){var relationships=[];return element.children.forEach(function(child){if("relationships:Relationship"===child.name){var relationship={relationshipId:child.attributes.Id,target:child.attributes.Target,type:child.attributes.Type};relationships.push(relationship)}}),new Relationships(relationships)}function Relationships(relationships){var targetsByRelationshipId=Object.create(null);relationships.forEach(function(relationship){targetsByRelationshipId[relationship.relationshipId]=relationship.target});var targetsByType=Object.create(null);return relationships.forEach(function(relationship){targetsByType[relationship.type]||(targetsByType[relationship.type]=[]),targetsByType[relationship.type].push(relationship.target)}),{findTargetByRelationshipId:function(relationshipId){return targetsByRelationshipId[relationshipId]},findTargetsByType:function(type){return targetsByType[type]||[]}}}exports.readRelationships=readRelationships,exports.defaultValue=new Relationships([]),exports.Relationships=Relationships},{}],14:[function(require,module,exports){function writeStyleMap(docxFile,styleMap){return docxFile.write(styleMapPath,styleMap),updateRelationships(docxFile).then(function(){return updateContentTypes(docxFile)})}function updateRelationships(docxFile){var path="word/_rels/document.xml.rels",relationshipsUri="http://schemas.openxmlformats.org/package/2006/relationships",relationshipElementName="{"+relationshipsUri+"}Relationship";return docxFile.read(path,"utf8").then(xml.readString).then(function(relationshipsContainer){var relationships=relationshipsContainer.children;addOrUpdateElement(relationships,relationshipElementName,"Id",{Id:"rMammothStyleMap",Type:schema,Target:styleMapAbsolutePath});var namespaces={"":relationshipsUri};return docxFile.write(path,xml.writeString(relationshipsContainer,namespaces))})}function updateContentTypes(docxFile){var path="[Content_Types].xml",contentTypesUri="http://schemas.openxmlformats.org/package/2006/content-types",overrideName="{"+contentTypesUri+"}Override";return docxFile.read(path,"utf8").then(xml.readString).then(function(typesElement){var children=typesElement.children;addOrUpdateElement(children,overrideName,"PartName",{PartName:styleMapAbsolutePath,ContentType:"text/prs.mammoth.style-map"});var namespaces={"":contentTypesUri};return docxFile.write(path,xml.writeString(typesElement,namespaces))})}function addOrUpdateElement(elements,name,identifyingAttribute,attributes){var existingElement=_.find(elements,function(element){return element.name===name&&element.attributes[identifyingAttribute]===attributes[identifyingAttribute]});existingElement?existingElement.attributes=attributes:elements.push(xml.element(name,attributes))}function readStyleMap(docxFile){return docxFile.exists(styleMapPath)?docxFile.read(styleMapPath,"utf8"):promises.resolve(null)}var _=require("underscore"),promises=require("../promises"),xml=require("../xml");exports.writeStyleMap=writeStyleMap,exports.readStyleMap=readStyleMap;var schema="http://schemas.zwobble.org/mammoth/style-map",styleMapPath="mammoth/style-map",styleMapAbsolutePath="/"+styleMapPath},{"../promises":23,"../xml":35,underscore:67}],15:[function(require,module,exports){function Styles(paragraphStyles,characterStyles,tableStyles,numberingStyles){return{findParagraphStyleById:function(styleId){return paragraphStyles[styleId]},findCharacterStyleById:function(styleId){return characterStyles[styleId]},findTableStyleById:function(styleId){return tableStyles[styleId]},findNumberingStyleById:function(styleId){return numberingStyles[styleId]}}}function readStylesXml(root){var paragraphStyles=Object.create(null),characterStyles=Object.create(null),tableStyles=Object.create(null),numberingStyles=Object.create(null);return root.getElementsByTagName("w:style").forEach(function(styleElement){var styleSet,style=readStyleElement(styleElement);switch(style.type){case"paragraph":styleSet=paragraphStyles;break;case"character":styleSet=characterStyles;break;case"table":styleSet=tableStyles;break;case"numbering":styleSet=numberingStyles}styleSet&&void 0===styleSet[style.styleId]&&(styleSet[style.styleId]=style)}),new Styles(paragraphStyles,characterStyles,tableStyles,numberingStyles)}function readStyleElement(styleElement){var type=styleElement.attributes["w:type"];if("numbering"===type)return readNumberingStyleElement(type,styleElement);var styleId=readStyleId(styleElement),name=styleName(styleElement);return{type:type,styleId:styleId,name:name}}function styleName(styleElement){var nameElement=styleElement.first("w:name");return nameElement?nameElement.attributes["w:val"]:null}function readNumberingStyleElement(type,styleElement){var styleId=readStyleId(styleElement),numId=styleElement.firstOrEmpty("w:pPr").firstOrEmpty("w:numPr").firstOrEmpty("w:numId").attributes["w:val"];return{type:type,numId:numId,styleId:styleId}}function readStyleId(styleElement){return styleElement.attributes["w:styleId"]}exports.readStylesXml=readStylesXml,exports.Styles=Styles,exports.defaultStyles=new Styles({},{}),Styles.EMPTY=new Styles({},{},{},{})},{}],16:[function(require,module,exports){function uriToZipEntryName(base,uri){return"/"===uri.charAt(0)?uri.substr(1):base+"/"+uri}function replaceFragment(uri,fragment){var hashIndex=uri.indexOf("#");return-1!==hashIndex&&(uri=uri.substring(0,hashIndex)),uri+"#"+fragment}exports.uriToZipEntryName=uriToZipEntryName,exports.replaceFragment=replaceFragment},{}],17:[function(require,module,exports){function nonFreshElement(tagName,attributes,children){return elementWithTag(htmlPaths.element(tagName,attributes,{fresh:!1}),children)}function freshElement(tagName,attributes,children){var tag=htmlPaths.element(tagName,attributes,{fresh:!0});return elementWithTag(tag,children)}function elementWithTag(tag,children){return{type:"element",tag:tag,children:children||[]}}function text(value){return{type:"text",value:value}}function isVoidElement(node){return 0===node.children.length&&voidTagNames[node.tag.tagName]}var htmlPaths=require("../styles/html-paths"),forceWrite={type:"forceWrite"};exports.freshElement=freshElement,exports.nonFreshElement=nonFreshElement,exports.elementWithTag=elementWithTag,exports.text=text,exports.forceWrite=forceWrite;var voidTagNames={br:!0,hr:!0,img:!0,input:!0};exports.isVoidElement=isVoidElement},{"../styles/html-paths":28}],18:[function(require,module,exports){function write(writer,nodes){nodes.forEach(function(node){writeNode(writer,node)})}function writeNode(writer,node){toStrings[node.type](writer,node)}function generateElementString(writer,node){ast.isVoidElement(node)?writer.selfClosing(node.tag.tagName,node.tag.attributes):(writer.open(node.tag.tagName,node.tag.attributes),write(writer,node.children),writer.close(node.tag.tagName))}function generateTextString(writer,node){writer.text(node.value)}var ast=require("./ast");exports.freshElement=ast.freshElement,exports.nonFreshElement=ast.nonFreshElement,exports.elementWithTag=ast.elementWithTag,exports.text=ast.text,exports.forceWrite=ast.forceWrite,exports.simplify=require("./simplify");var toStrings={element:generateElementString,text:generateTextString,forceWrite:function(){}};exports.write=write},{"./ast":17,"./simplify":19}],19:[function(require,module,exports){function simplify(nodes){return collapse(removeEmpty(nodes))}function collapse(nodes){var children=[];return nodes.map(collapseNode).forEach(function(child){appendChild(children,child)}),children}function collapseNode(node){return collapsers[node.type](node)}function collapseElement(node){return ast.elementWithTag(node.tag,collapse(node.children))}function identity(value){return value}function appendChild(children,child){var lastChild=children[children.length-1];"element"===child.type&&!child.tag.fresh&&lastChild&&"element"===lastChild.type&&child.tag.matchesElement(lastChild.tag)?(child.tag.separator&&appendChild(lastChild.children,ast.text(child.tag.separator)),child.children.forEach(function(grandChild){appendChild(lastChild.children,grandChild)})):children.push(child)}function removeEmpty(nodes){return flatMap(nodes,function(node){return emptiers[node.type](node)})}function flatMap(values,func){return _.flatten(_.map(values,func),!0)}function neverEmpty(node){return[node]}function elementEmptier(element){var children=removeEmpty(element.children);return 0!==children.length||ast.isVoidElement(element)?[ast.elementWithTag(element.tag,children)]:[]}function textEmptier(node){return 0===node.value.length?[]:[node]}var _=require("underscore"),ast=require("./ast"),collapsers={element:collapseElement,text:identity,forceWrite:identity},emptiers={element:elementEmptier,text:textEmptier,forceWrite:neverEmpty};module.exports=simplify},{"./ast":17,underscore:67}],20:[function(require,module,exports){function imgElement(func){return function(element,messages){return promises.resolve(func(element)).then(function(result){var attributes={};return element.altText&&(attributes.alt=element.altText),_.extend(attributes,result),[Html.freshElement("img",attributes)]})}}function imageFilenameExtension(image){return image.contentType.split(/\/|\\/)[1]}var _=require("underscore"),promises=require("./promises"),Html=require("./html");exports.imgElement=imgElement,exports.inline=exports.imgElement,exports.dataUri=imgElement(function(element){return element.readAsBase64String().then(function(imageBuffer){return{src:"data:"+element.contentType+";base64,"+imageBuffer}})}),exports.imageFilenameExtension=imageFilenameExtension},{"./html":18,"./promises":23,underscore:67}],21:[function(require,module,exports){(function(Buffer){function convertToHtml(input,options){return convert(input,options)}function convertToMarkdown(input,options){var markdownOptions=Object.create(options||{});return markdownOptions.outputFormat="markdown",convert(input,markdownOptions)}function convert(input,options){options=readOptions(options);var result=unzip.openZip(input).then(function(docxFile){return docxStyleMap.readStyleMap(docxFile).then(function(styleMap){return options.embeddedStyleMap=styleMap,docxFile})}).then(function(docxFile){return docxReader.read(docxFile,input,options).then(function(documentResult){return documentResult.map(options.transformDocument)}).then(function(documentResult){return convertDocumentToHtml(documentResult,options)})});return promises.toExternalPromise(result)}function readEmbeddedStyleMap(input){var result=unzip.openZip(input).then(docxStyleMap.readStyleMap);return promises.toExternalPromise(result)}function convertDocumentToHtml(documentResult,options){var styleMapResult=parseStyleMap(options.readStyleMap()),parsedOptions=_.extend({},options,{styleMap:styleMapResult.value}),documentConverter=new DocumentConverter(parsedOptions);return documentResult.flatMapThen(function(document){return styleMapResult.flatMapThen(function(styleMap){return documentConverter.convertToHtml(document)})})}function parseStyleMap(styleMap){return Result.combine((styleMap||[]).map(readStyle)).map(function(styleMap){return styleMap.filter(function(styleMapping){return!!styleMapping})})}function extractRawText(input){var result=unzip.openZip(input).then(docxReader.read).then(function(documentResult){return documentResult.map(convertElementToRawText)});return promises.toExternalPromise(result)}function embedStyleMap(input,styleMap){var result=unzip.openZip(input).then(function(docxFile){return docxStyleMap.writeStyleMap(docxFile,styleMap).then(function(){return docxFile})}).then(function(docxFile){return docxFile.toArrayBuffer()}).then(function(arrayBuffer){return{toArrayBuffer:function(){return arrayBuffer},toBuffer:function(){return Buffer.from(arrayBuffer)}}});return promises.toExternalPromise(result)}var _=require("underscore"),docxReader=require("./docx/docx-reader"),docxStyleMap=require("./docx/style-map"),DocumentConverter=require("./document-to-html").DocumentConverter,convertElementToRawText=require("./raw-text").convertElementToRawText,readStyle=require("./style-reader").readStyle,readOptions=require("./options-reader").readOptions,promises=require("./promises"),unzip=require("./unzip"),Result=require("./results").Result;exports.convertToHtml=convertToHtml,exports.convertToMarkdown=convertToMarkdown,exports.convert=convert,exports.extractRawText=extractRawText,exports.images=require("./images"),exports.transforms=require("./transforms"),exports.underline=require("./underline"),exports.embedStyleMap=embedStyleMap,exports.readEmbeddedStyleMap=readEmbeddedStyleMap,exports.styleMapping=function(){throw new Error("Use a raw string instead of mammoth.styleMapping e.g. \"p[style-name='Title'] => h1\" instead of mammoth.styleMapping(\"p[style-name='Title'] => h1\")")}}).call(this,require("buffer").Buffer)},{"./document-to-html":3,"./docx/docx-reader":9,"./docx/style-map":14,"./images":20,"./options-reader":22,"./promises":23,"./raw-text":24,"./results":25,"./style-reader":26,"./transforms":30,"./underline":31,"./unzip":2,buffer:48,underscore:67}],22:[function(require,module,exports){function readOptions(options){return options=options||{},_.extend({},standardOptions,options,{customStyleMap:readStyleMap(options.styleMap),readStyleMap:function(){var styleMap=this.customStyleMap;return this.includeEmbeddedStyleMap&&(styleMap=styleMap.concat(readStyleMap(this.embeddedStyleMap))),this.includeDefaultStyleMap&&(styleMap=styleMap.concat(defaultStyleMap)),styleMap}})}function readStyleMap(styleMap){return styleMap?_.isString(styleMap)?styleMap.split("\n").map(function(line){return line.trim()}).filter(function(line){return""!==line&&"#"!==line.charAt(0)}):styleMap:[]}function identity(value){return value}exports.readOptions=readOptions;var _=require("underscore"),defaultStyleMap=exports._defaultStyleMap=["p.Heading1 => h1:fresh","p.Heading2 => h2:fresh","p.Heading3 => h3:fresh","p.Heading4 => h4:fresh","p.Heading5 => h5:fresh","p.Heading6 => h6:fresh","p[style-name='Heading 1'] => h1:fresh","p[style-name='Heading 2'] => h2:fresh","p[style-name='Heading 3'] => h3:fresh","p[style-name='Heading 4'] => h4:fresh","p[style-name='Heading 5'] => h5:fresh","p[style-name='Heading 6'] => h6:fresh","p[style-name='heading 1'] => h1:fresh","p[style-name='heading 2'] => h2:fresh","p[style-name='heading 3'] => h3:fresh","p[style-name='heading 4'] => h4:fresh","p[style-name='heading 5'] => h5:fresh","p[style-name='heading 6'] => h6:fresh","p.Heading => h1:fresh","p[style-name='Heading'] => h1:fresh","r[style-name='Strong'] => strong","p[style-name='footnote text'] => p:fresh","r[style-name='footnote reference'] =>","p[style-name='endnote text'] => p:fresh","r[style-name='endnote reference'] =>","p[style-name='annotation text'] => p:fresh","r[style-name='annotation reference'] =>","p[style-name='Footnote'] => p:fresh","r[style-name='Footnote anchor'] =>","p[style-name='Endnote'] => p:fresh","r[style-name='Endnote anchor'] =>","p:unordered-list(1) => ul > li:fresh","p:unordered-list(2) => ul|ol > li > ul > li:fresh","p:unordered-list(3) => ul|ol > li > ul|ol > li > ul > li:fresh","p:unordered-list(4) => ul|ol > li > ul|ol > li > ul|ol > li > ul > li:fresh","p:unordered-list(5) => ul|ol > li > ul|ol > li > ul|ol > li > ul|ol > li > ul > li:fresh","p:ordered-list(1) => ol > li:fresh","p:ordered-list(2) => ul|ol > li > ol > li:fresh","p:ordered-list(3) => ul|ol > li > ul|ol > li > ol > li:fresh","p:ordered-list(4) => ul|ol > li > ul|ol > li > ul|ol > li > ol > li:fresh","p:ordered-list(5) => ul|ol > li > ul|ol > li > ul|ol > li > ul|ol > li > ol > li:fresh","r[style-name='Hyperlink'] =>","p[style-name='Normal'] => p:fresh","p.Body => p:fresh","p[style-name='Body'] => p:fresh"],standardOptions=exports._standardOptions={
externalFileAccess:!1,transformDocument:identity,includeDefaultStyleMap:!0,includeEmbeddedStyleMap:!0}},{underscore:67}],23:[function(require,module,exports){(function(process){function addAlsoToPromise(promise){return promise.also=alsoMethod,promise}function defer(){var resolve,reject,promise=new Promise(function(resolveArg,rejectArg){resolve=resolveArg,reject=rejectArg});return{resolve:resolve,reject:reject,promise:promise}}function ExternalPromise(executor){var promise=new Promise(executor);return promise.__proto__=ExternalPromise.prototype,promise}function toExternalPromise(promise){return ExternalPromise.resolve(promise)}function isNode(){return"undefined"==typeof process?!1:"[object process]"==={}.toString.call(process).toLowerCase()}var _=require("underscore");exports.defer=defer,exports.Promise=Promise,exports.resolve=Promise.resolve.bind(Promise),exports.reject=Promise.reject.bind(Promise),exports.forEachSeries=function(array,func){var arrayIndex=0,deferred=defer(),next=function(){if(arrayIndex<array.length){var element=array[arrayIndex];arrayIndex++,func(element).then(next,deferred.reject)}else deferred.resolve()};return next(),deferred.promise};var props=exports.props=function(obj){var keys=Object.keys(obj),values=Object.values(obj),result=Promise.all(values).then(function(resolvedValues){for(var resolvedObj={},index=0;index<keys.length;index++)resolvedObj[keys[index]]=resolvedValues[index];return resolvedObj});return addAlsoToPromise(result)},alsoMethod=function(func){var result=this.then(function(value){var returnValue=_.extend({},value,func(value));return props(returnValue)});return addAlsoToPromise(result)};exports["try"]=function(func){try{return Promise.resolve(func())}catch(error){return Promise.reject(error)}},ExternalPromise.__proto__=Promise,ExternalPromise.prototype.__proto__=Promise.prototype,ExternalPromise.prototype.done=function(resolve,reject){return this.then(resolve,reject)["catch"](function(error){if(isNode()){var stack=error instanceof Error?error.stack:error;process.stderr.write("Fatal "+stack+"\n"),process.exit(2)}else setTimeout(function(){throw error},0)})},exports.toExternalPromise=toExternalPromise}).call(this,require("_process"))},{_process:66,underscore:67}],24:[function(require,module,exports){function convertElementToRawText(element){if("text"===element.type)return element.value;if(element.type===documents.types.tab)return"	";var tail="paragraph"===element.type?"\n\n":"";return(element.children||[]).map(convertElementToRawText).join("")+tail}var documents=require("./documents");exports.convertElementToRawText=convertElementToRawText},{"./documents":4}],25:[function(require,module,exports){function Result(value,messages){this.value=value,this.messages=messages||[]}function success(value){return new Result(value,[])}function warning(message){return{type:"warning",message:message}}function error(exception){return{type:"error",message:exception.message,error:exception}}function combineMessages(results){var messages=[];return _.flatten(_.pluck(results,"messages"),!0).forEach(function(message){containsMessage(messages,message)||messages.push(message)}),messages}function containsMessage(messages,message){return void 0!==_.find(messages,isSameMessage.bind(null,message))}function isSameMessage(first,second){return first.type===second.type&&first.message===second.message}var _=require("underscore");exports.Result=Result,exports.success=success,exports.warning=warning,exports.error=error,Result.prototype.map=function(func){return new Result(func(this.value),this.messages)},Result.prototype.flatMap=function(func){var funcResult=func(this.value);return new Result(funcResult.value,combineMessages([this,funcResult]))},Result.prototype.flatMapThen=function(func){var that=this;return func(this.value).then(function(otherResult){return new Result(otherResult.value,combineMessages([that,otherResult]))})},Result.combine=function(results){var values=_.flatten(_.pluck(results,"value")),messages=combineMessages(results);return new Result(values,messages)}},{underscore:67}],26:[function(require,module,exports){function readStyle(string){return parseString(styleRule,string)}function createStyleRule(){return lop.rules.sequence(lop.rules.sequence.capture(documentMatcherRule()),lop.rules.tokenOfType("whitespace"),lop.rules.tokenOfType("arrow"),lop.rules.sequence.capture(lop.rules.optional(lop.rules.sequence(lop.rules.tokenOfType("whitespace"),lop.rules.sequence.capture(htmlPathRule())).head())),lop.rules.tokenOfType("end")).map(function(documentMatcher,htmlPath){return{from:documentMatcher,to:htmlPath.valueOrElse(htmlPaths.empty)}})}function readDocumentMatcher(string){return parseString(documentMatcherRule(),string)}function documentMatcherRule(){function createMatcherSuffixesRule(rules){var matcherSuffix=lop.rules.firstOf.apply(lop.rules.firstOf,["matcher suffix"].concat(rules)),matcherSuffixes=lop.rules.zeroOrMore(matcherSuffix);return lop.rules.then(matcherSuffixes,function(suffixes){var matcherOptions={};return suffixes.forEach(function(suffix){_.extend(matcherOptions,suffix)}),matcherOptions})}var sequence=lop.rules.sequence,identifierToConstant=function(identifier,constant){return lop.rules.then(lop.rules.token("identifier",identifier),function(){return constant})},paragraphRule=identifierToConstant("p",documentMatchers.paragraph),runRule=identifierToConstant("r",documentMatchers.run),elementTypeRule=lop.rules.firstOf("p or r or table",paragraphRule,runRule),styleIdRule=lop.rules.sequence(lop.rules.tokenOfType("dot"),lop.rules.sequence.cut(),lop.rules.sequence.capture(identifierRule)).map(function(styleId){return{styleId:styleId}}),styleNameMatcherRule=lop.rules.firstOf("style name matcher",lop.rules.then(lop.rules.sequence(lop.rules.tokenOfType("equals"),lop.rules.sequence.cut(),lop.rules.sequence.capture(stringRule)).head(),function(styleName){return{styleName:documentMatchers.equalTo(styleName)}}),lop.rules.then(lop.rules.sequence(lop.rules.tokenOfType("startsWith"),lop.rules.sequence.cut(),lop.rules.sequence.capture(stringRule)).head(),function(styleName){return{styleName:documentMatchers.startsWith(styleName)}})),styleNameRule=lop.rules.sequence(lop.rules.tokenOfType("open-square-bracket"),lop.rules.sequence.cut(),lop.rules.token("identifier","style-name"),lop.rules.sequence.capture(styleNameMatcherRule),lop.rules.tokenOfType("close-square-bracket")).head(),listTypeRule=lop.rules.firstOf("list type",identifierToConstant("ordered-list",{isOrdered:!0}),identifierToConstant("unordered-list",{isOrdered:!1})),listRule=sequence(lop.rules.tokenOfType("colon"),sequence.capture(listTypeRule),sequence.cut(),lop.rules.tokenOfType("open-paren"),sequence.capture(integerRule),lop.rules.tokenOfType("close-paren")).map(function(listType,levelNumber){return{list:{isOrdered:listType.isOrdered,levelIndex:levelNumber-1}}}),paragraphOrRun=sequence(sequence.capture(elementTypeRule),sequence.capture(createMatcherSuffixesRule([styleIdRule,styleNameRule,listRule]))).map(function(createMatcher,matcherOptions){return createMatcher(matcherOptions)}),table=sequence(lop.rules.token("identifier","table"),sequence.capture(createMatcherSuffixesRule([styleIdRule,styleNameRule]))).map(function(options){return documentMatchers.table(options)}),bold=identifierToConstant("b",documentMatchers.bold),italic=identifierToConstant("i",documentMatchers.italic),underline=identifierToConstant("u",documentMatchers.underline),strikethrough=identifierToConstant("strike",documentMatchers.strikethrough),allCaps=identifierToConstant("all-caps",documentMatchers.allCaps),smallCaps=identifierToConstant("small-caps",documentMatchers.smallCaps),highlight=sequence(lop.rules.token("identifier","highlight"),lop.rules.sequence.capture(lop.rules.optional(lop.rules.sequence(lop.rules.tokenOfType("open-square-bracket"),lop.rules.sequence.cut(),lop.rules.token("identifier","color"),lop.rules.tokenOfType("equals"),lop.rules.sequence.capture(stringRule),lop.rules.tokenOfType("close-square-bracket")).head()))).map(function(color){return documentMatchers.highlight({color:color.valueOrElse(void 0)})}),commentReference=identifierToConstant("comment-reference",documentMatchers.commentReference),breakMatcher=sequence(lop.rules.token("identifier","br"),sequence.cut(),lop.rules.tokenOfType("open-square-bracket"),lop.rules.token("identifier","type"),lop.rules.tokenOfType("equals"),sequence.capture(stringRule),lop.rules.tokenOfType("close-square-bracket")).map(function(breakType){switch(breakType){case"line":return documentMatchers.lineBreak;case"page":return documentMatchers.pageBreak;case"column":return documentMatchers.columnBreak}});return lop.rules.firstOf("element type",paragraphOrRun,table,bold,italic,underline,strikethrough,allCaps,smallCaps,highlight,commentReference,breakMatcher)}function readHtmlPath(string){return parseString(htmlPathRule(),string)}function htmlPathRule(){var capture=lop.rules.sequence.capture,whitespaceRule=lop.rules.tokenOfType("whitespace"),freshRule=lop.rules.then(lop.rules.optional(lop.rules.sequence(lop.rules.tokenOfType("colon"),lop.rules.token("identifier","fresh"))),function(option){return option.map(function(){return!0}).valueOrElse(!1)}),separatorRule=lop.rules.then(lop.rules.optional(lop.rules.sequence(lop.rules.tokenOfType("colon"),lop.rules.token("identifier","separator"),lop.rules.tokenOfType("open-paren"),capture(stringRule),lop.rules.tokenOfType("close-paren")).head()),function(option){return option.valueOrElse("")}),tagNamesRule=lop.rules.oneOrMoreWithSeparator(identifierRule,lop.rules.tokenOfType("choice")),styleElementRule=lop.rules.sequence(capture(tagNamesRule),capture(lop.rules.zeroOrMore(attributeOrClassRule)),capture(freshRule),capture(separatorRule)).map(function(tagName,attributesList,fresh,separator){var attributes=Object.create(null),options={};return attributesList.forEach(function(attribute){attribute.append&&attributes[attribute.name]?attributes[attribute.name]+=" "+attribute.value:attributes[attribute.name]=attribute.value}),fresh&&(options.fresh=!0),separator&&(options.separator=separator),htmlPaths.element(tagName,attributes,options)});return lop.rules.firstOf("html path",lop.rules.then(lop.rules.tokenOfType("bang"),function(){return htmlPaths.ignore}),lop.rules.then(lop.rules.zeroOrMoreWithSeparator(styleElementRule,lop.rules.sequence(whitespaceRule,lop.rules.tokenOfType("gt"),whitespaceRule)),htmlPaths.elements))}function decodeEscapeSequences(value){return value.replace(/\\(.)/g,function(match,code){return escapeSequences[code]||code})}function parseString(rule,string){var tokens=tokenise(string),parser=lop.Parser(),parseResult=parser.parseTokens(rule,tokens);return parseResult.isSuccess()?results.success(parseResult.value()):new results.Result(null,[results.warning(describeFailure(string,parseResult))])}function describeFailure(input,parseResult){return"Did not understand this style mapping, so ignored it: "+input+"\n"+parseResult.errors().map(describeError).join("\n")}function describeError(error){return"Error was at character number "+error.characterNumber()+": Expected "+error.expected+" but got "+error.actual}var _=require("underscore"),lop=require("lop"),documentMatchers=require("./styles/document-matchers"),htmlPaths=require("./styles/html-paths"),tokenise=require("./styles/parser/tokeniser").tokenise,results=require("./results");exports.readHtmlPath=readHtmlPath,exports.readDocumentMatcher=readDocumentMatcher,exports.readStyle=readStyle;var identifierRule=lop.rules.then(lop.rules.tokenOfType("identifier"),decodeEscapeSequences),integerRule=lop.rules.tokenOfType("integer"),stringRule=lop.rules.then(lop.rules.tokenOfType("string"),decodeEscapeSequences),escapeSequences={n:"\n",r:"\r",t:"	"},attributeRule=lop.rules.sequence(lop.rules.tokenOfType("open-square-bracket"),lop.rules.sequence.cut(),lop.rules.sequence.capture(identifierRule),lop.rules.tokenOfType("equals"),lop.rules.sequence.capture(stringRule),lop.rules.tokenOfType("close-square-bracket")).map(function(name,value){return{name:name,value:value,append:!1}}),classRule=lop.rules.sequence(lop.rules.tokenOfType("dot"),lop.rules.sequence.cut(),lop.rules.sequence.capture(identifierRule)).map(function(className){return{name:"class",value:className,append:!0}}),attributeOrClassRule=lop.rules.firstOf("attribute or class",attributeRule,classRule),styleRule=createStyleRule()},{"./results":25,"./styles/document-matchers":27,"./styles/html-paths":28,"./styles/parser/tokeniser":29,lop:54,underscore:67}],27:[function(require,module,exports){function paragraph(options){return new Matcher("paragraph",options)}function run(options){return new Matcher("run",options)}function table(options){return new Matcher("table",options)}function highlight(options){return new HighlightMatcher(options)}function Matcher(elementType,options){options=options||{},this._elementType=elementType,this._styleId=options.styleId,this._styleName=options.styleName,options.list&&(this._listIndex=options.list.levelIndex,this._listIsOrdered=options.list.isOrdered)}function HighlightMatcher(options){options=options||{},this._color=options.color}function BreakMatcher(options){options=options||{},this._breakType=options.breakType}function isList(element,levelIndex,isOrdered){return element.numbering&&element.numbering.level==levelIndex&&element.numbering.isOrdered==isOrdered}function equalTo(value){return{operator:operatorEqualTo,operand:value}}function startsWith(value){return{operator:operatorStartsWith,operand:value}}function operatorEqualTo(first,second){return first.toUpperCase()===second.toUpperCase()}function operatorStartsWith(first,second){return 0===second.toUpperCase().indexOf(first.toUpperCase())}exports.paragraph=paragraph,exports.run=run,exports.table=table,exports.bold=new Matcher("bold"),exports.italic=new Matcher("italic"),exports.underline=new Matcher("underline"),exports.strikethrough=new Matcher("strikethrough"),exports.allCaps=new Matcher("allCaps"),exports.smallCaps=new Matcher("smallCaps"),exports.highlight=highlight,exports.commentReference=new Matcher("commentReference"),exports.lineBreak=new BreakMatcher({breakType:"line"}),exports.pageBreak=new BreakMatcher({breakType:"page"}),exports.columnBreak=new BreakMatcher({breakType:"column"}),exports.equalTo=equalTo,exports.startsWith=startsWith,Matcher.prototype.matches=function(element){return element.type===this._elementType&&(void 0===this._styleId||element.styleId===this._styleId)&&(void 0===this._styleName||element.styleName&&this._styleName.operator(this._styleName.operand,element.styleName))&&(void 0===this._listIndex||isList(element,this._listIndex,this._listIsOrdered))&&(void 0===this._breakType||this._breakType===element.breakType)},HighlightMatcher.prototype.matches=function(element){return"highlight"===element.type&&(void 0===this._color||element.color===this._color)},BreakMatcher.prototype.matches=function(element){return"break"===element.type&&(void 0===this._breakType||element.breakType===this._breakType)}},{}],28:[function(require,module,exports){function topLevelElement(tagName,attributes){return elements([element(tagName,attributes,{fresh:!0})])}function elements(elementStyles){return new HtmlPath(elementStyles.map(function(elementStyle){return _.isString(elementStyle)?element(elementStyle):elementStyle}))}function HtmlPath(elements){this._elements=elements}function element(tagName,attributes,options){return options=options||{},new Element(tagName,attributes,options)}function Element(tagName,attributes,options){var tagNames=Object.create(null);_.isArray(tagName)?(tagName.forEach(function(tagName){tagNames[tagName]=!0}),tagName=tagName[0]):tagNames[tagName]=!0,this.tagName=tagName,this.tagNames=tagNames,this.attributes=attributes||{},this.fresh=options.fresh,this.separator=options.separator}var _=require("underscore"),html=require("../html");exports.topLevelElement=topLevelElement,exports.elements=elements,exports.element=element,HtmlPath.prototype.wrap=function(children){for(var result=children(),index=this._elements.length-1;index>=0;index--)result=this._elements[index].wrapNodes(result);return result},Element.prototype.matchesElement=function(element){return this.tagNames[element.tagName]&&_.isEqual(this.attributes||{},element.attributes||{})},Element.prototype.wrap=function(generateNodes){return this.wrapNodes(generateNodes())},Element.prototype.wrapNodes=function(nodes){return[html.elementWithTag(this,nodes)]},exports.empty=elements([]),exports.ignore={wrap:function(){return[]}}},{"../html":18,underscore:67}],29:[function(require,module,exports){function tokenise(string){var identifierCharacter="(?:[a-zA-Z\\-_]|\\\\.)",tokeniser=new RegexTokeniser([{name:"identifier",regex:new RegExp("("+identifierCharacter+"(?:"+identifierCharacter+"|[0-9])*)")},{name:"dot",regex:/\./},{name:"colon",regex:/:/},{name:"gt",regex:/>/},{name:"whitespace",regex:/\s+/},{name:"arrow",regex:/=>/},{name:"equals",regex:/=/},{name:"startsWith",regex:/\^=/},{name:"open-paren",regex:/\(/},{name:"close-paren",regex:/\)/},{name:"open-square-bracket",regex:/\[/},{name:"close-square-bracket",regex:/\]/},{name:"string",regex:new RegExp(stringPrefix+"'")},{name:"unterminated-string",regex:new RegExp(stringPrefix)},{name:"integer",regex:/([0-9]+)/},{name:"choice",regex:/\|/},{name:"bang",regex:/(!)/}]);return tokeniser.tokenise(string)}var lop=require("lop"),RegexTokeniser=lop.RegexTokeniser;exports.tokenise=tokenise;var stringPrefix="'((?:\\\\(?:.|$)|[^'\\\\])*)"},{lop:54}],30:[function(require,module,exports){function paragraph(transform){return elementsOfType("paragraph",transform)}function run(transform){return elementsOfType("run",transform)}function elementsOfType(elementType,transform){return elements(function(element){return element.type===elementType?transform(element):element})}function elements(transform){return function transformElement(element){if(element.children){var children=_.map(element.children,transformElement);element=_.extend(element,{children:children})}return transform(element)}}function getDescendantsOfType(element,type){return getDescendants(element).filter(function(descendant){return descendant.type===type})}function getDescendants(element){var descendants=[];return visitDescendants(element,function(descendant){descendants.push(descendant)}),descendants}function visitDescendants(element,visit){element.children&&element.children.forEach(function(child){visitDescendants(child,visit),visit(child)})}var _=require("underscore");exports.paragraph=paragraph,exports.run=run,exports._elements=elements,exports._elementsOfType=elementsOfType,exports.getDescendantsOfType=getDescendantsOfType,exports.getDescendants=getDescendants},{underscore:67}],31:[function(require,module,exports){function element(name){return function(html){return Html.elementWithTag(htmlPaths.element(name),[html])}}var htmlPaths=require("./styles/html-paths"),Html=require("./html");exports.element=element},{"./html":18,"./styles/html-paths":28}],32:[function(require,module,exports){function writer(options){return options=options||{},options.prettyPrint?prettyWriter():simpleWriter()}function prettyWriter(){function open(tagName,attributes){indentedElements[tagName]&&indent(),stack.push(tagName),writer.open(tagName,attributes),indentedElements[tagName]&&indentationLevel++,start=!1}function close(tagName){indentedElements[tagName]&&(indentationLevel--,indent()),stack.pop(),writer.close(tagName)}function text(value){startText();var text=isInPre()?value:value.replace("\n","\n"+indentation);writer.text(text)}function selfClosing(tagName,attributes){indent(),writer.selfClosing(tagName,attributes)}function insideIndentedElement(){return 0===stack.length||indentedElements[stack[stack.length-1]]}function startText(){inText||(indent(),inText=!0)}function indent(){if(inText=!1,!start&&insideIndentedElement()&&!isInPre()){writer._append("\n");for(var i=0;indentationLevel>i;i++)writer._append(indentation)}}function isInPre(){return _.some(stack,function(tagName){return"pre"===tagName})}var indentationLevel=0,indentation="  ",stack=[],start=!0,inText=!1,writer=simpleWriter();return{asString:writer.asString,open:open,close:close,text:text,selfClosing:selfClosing}}function simpleWriter(){function open(tagName,attributes){var attributeString=generateAttributeString(attributes);fragments.push("<"+tagName+attributeString+">")}function close(tagName){fragments.push("</"+tagName+">")}function selfClosing(tagName,attributes){var attributeString=generateAttributeString(attributes);fragments.push("<"+tagName+attributeString+" />")}function generateAttributeString(attributes){return _.map(attributes,function(value,key){return" "+key+'="'+escapeHtmlAttribute(value)+'"'}).join("")}function text(value){fragments.push(escapeHtmlText(value))}function append(html){fragments.push(html)}function asString(){return fragments.join("")}var fragments=[];return{asString:asString,open:open,close:close,text:text,selfClosing:selfClosing,_append:append}}function escapeHtmlText(value){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function escapeHtmlAttribute(value){return value.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var _=require("underscore");exports.writer=writer;var indentedElements={div:!0,p:!0,ul:!0,li:!0}},{underscore:67}],33:[function(require,module,exports){function writer(options){return options=options||{},"markdown"===options.outputFormat?markdownWriter.writer():htmlWriter.writer(options)}var htmlWriter=require("./html-writer"),markdownWriter=require("./markdown-writer");exports.writer=writer},{"./html-writer":32,"./markdown-writer":34}],34:[function(require,module,exports){function symmetricMarkdownElement(end){return markdownElement(end,end)}function markdownElement(start,end){return function(){return{start:start,end:end}}}function markdownLink(attributes){var href=attributes.href||"";return href?{start:"[",end:"]("+escapeMarkdown(href)+")",anchorPosition:"before"}:{}}function markdownImage(attributes){var src=attributes.src||"",altText=attributes.alt||"";return src||altText?{start:"!["+escapeMarkdown(altText)+"]("+escapeMarkdown(src)+")"}:{}}function markdownList(options){return function(attributes,list){return{start:list?"\n":"",end:list?"":"\n",list:{isOrdered:options.isOrdered,indent:list?list.indent+1:0,count:0}}}}function markdownListItem(attributes,list,listItem){list=list||{indent:0,isOrdered:!1,count:0},list.count++,listItem.hasClosed=!1;var bullet=list.isOrdered?list.count+".":"-",start=repeatString("	",list.indent)+bullet+" ";return{start:start,end:function(){return listItem.hasClosed?void 0:(listItem.hasClosed=!0,"\n")}}}function repeatString(value,count){return new Array(count+1).join(value)}function markdownWriter(){function open(tagName,attributes){attributes=attributes||{};var createElement=htmlToMarkdown[tagName]||function(){return{}},element=createElement(attributes,list,listItem);elementStack.push({end:element.end,list:list}),element.list&&(list=element.list);var anchorBeforeStart="before"===element.anchorPosition;anchorBeforeStart&&writeAnchor(attributes),fragments.push(element.start||""),anchorBeforeStart||writeAnchor(attributes)}function writeAnchor(attributes){if(attributes.id){var writer=htmlWriter.writer();writer.open("a",{id:attributes.id}),writer.close("a"),fragments.push(writer.asString())}}function close(tagName){var element=elementStack.pop();list=element.list;var end=_.isFunction(element.end)?element.end():element.end;fragments.push(end||"")}function selfClosing(tagName,attributes){open(tagName,attributes),close(tagName)}function text(value){fragments.push(escapeMarkdown(value))}function asString(){return fragments.join("")}var fragments=[],elementStack=[],list=null,listItem={};return{asString:asString,open:open,close:close,text:text,selfClosing:selfClosing}}function escapeMarkdown(value){return value.replace(/\\/g,"\\\\").replace(/([\`\*_\{\}\[\]\(\)\#\+\-\.\!])/g,"\\$1")}var _=require("underscore"),htmlWriter=require("./html-writer"),htmlToMarkdown={p:markdownElement("","\n\n"),br:markdownElement("","  \n"),ul:markdownList({isOrdered:!1}),ol:markdownList({isOrdered:!0}),li:markdownListItem,strong:symmetricMarkdownElement("__"),em:symmetricMarkdownElement("*"),a:markdownLink,img:markdownImage};!function(){for(var i=1;6>=i;i++)htmlToMarkdown["h"+i]=markdownElement(repeatString("#",i)+" ","\n\n")}(),exports.writer=markdownWriter},{"./html-writer":32,underscore:67}],35:[function(require,module,exports){var nodes=require("./nodes");exports.Element=nodes.Element,exports.element=nodes.element,exports.emptyElement=nodes.emptyElement,exports.text=nodes.text,exports.readString=require("./reader").readString,exports.writeString=require("./writer").writeString},{"./nodes":36,"./reader":37,"./writer":38}],36:[function(require,module,exports){function Element(name,attributes,children){this.type="element",this.name=name,this.attributes=attributes||{},this.children=children||[]}function toElementList(array){return _.extend(array,elementListPrototype)}var _=require("underscore");exports.Element=Element,exports.element=function(name,attributes,children){return new Element(name,attributes,children)},exports.text=function(value){return{type:"text",value:value}};var emptyElement=exports.emptyElement={first:function(){return null},firstOrEmpty:function(){return emptyElement},attributes:{},children:[]};Element.prototype.first=function(name){return _.find(this.children,function(child){return child.name===name})},Element.prototype.firstOrEmpty=function(name){return this.first(name)||emptyElement},Element.prototype.getElementsByTagName=function(name){var elements=_.filter(this.children,function(child){return child.name===name});return toElementList(elements)},Element.prototype.text=function(){if(0===this.children.length)return"";if(1!==this.children.length||"text"!==this.children[0].type)throw new Error("Not implemented");return this.children[0].value};var elementListPrototype={getElementsByTagName:function(name){return toElementList(_.flatten(this.map(function(element){return element.getElementsByTagName(name)},!0)))}}},{underscore:67}],37:[function(require,module,exports){function readString(xmlString,namespaceMap){function convertNode(node){switch(node.nodeType){case Node.ELEMENT_NODE:return convertElement(node);case Node.TEXT_NODE:return nodes.text(node.nodeValue)}}function convertElement(element){var convertedName=convertName(element),convertedChildren=[];_.forEach(element.childNodes,function(childNode){var convertedNode=convertNode(childNode);convertedNode&&convertedChildren.push(convertedNode)});var convertedAttributes=Object.create(null);return _.forEach(element.attributes,function(attribute){convertedAttributes[convertName(attribute)]=attribute.value}),new Element(convertedName,convertedAttributes,convertedChildren)}function convertName(node){if(node.namespaceURI){var prefix,mappedPrefix=namespaceMap[node.namespaceURI];return prefix=mappedPrefix?mappedPrefix+":":"{"+node.namespaceURI+"}",prefix+node.localName}return node.localName}namespaceMap=namespaceMap||{};try{var document=xmldom.parseFromString(xmlString,"text/xml")}catch(error){return promises.reject(error)}return"parsererror"===document.documentElement.tagName?promises.resolve(new Error(document.documentElement.textContent)):promises.resolve(convertNode(document.documentElement))}var promises=require("../promises"),_=require("underscore"),xmldom=require("./xmldom"),nodes=require("./nodes"),Element=nodes.Element;exports.readString=readString;var Node=xmldom.Node},{"../promises":23,"./nodes":36,"./xmldom":39,underscore:67}],38:[function(require,module,exports){function writeString(root,namespaces){function writeNode(builder,node){return nodeWriters[node.type](builder,node)}function writeElement(builder,element){var elementBuilder=builder.element(mapElementName(element.name),element.attributes);element.children.forEach(function(child){writeNode(elementBuilder,child)})}function mapElementName(name){var longFormMatch=/^\{(.*)\}(.*)$/.exec(name);if(longFormMatch){var prefix=uriToPrefix[longFormMatch[1]];return prefix+(""===prefix?"":":")+longFormMatch[2]}return name}function writeDocument(root){var builder=xmlbuilder.create(mapElementName(root.name),{version:"1.0",encoding:"UTF-8",standalone:!0});return _.forEach(namespaces,function(uri,prefix){var key="xmlns"+(""===prefix?"":":"+prefix);builder.attribute(key,uri)}),root.children.forEach(function(child){writeNode(builder,child)}),builder.end()}var uriToPrefix=_.invert(namespaces),nodeWriters={element:writeElement,text:writeTextNode};return writeDocument(root)}function writeTextNode(builder,node){builder.text(node.value)}var _=require("underscore"),xmlbuilder=require("xmlbuilder");exports.writeString=writeString},{underscore:67,xmlbuilder:89}],39:[function(require,module,exports){function parseFromString(string){var error=null,domParser=new xmldom.DOMParser({errorHandler:function(level,message){error={level:level,message:message}}}),document=domParser.parseFromString(string);if(null===error)return document;throw new Error(error.level+": "+error.message)}var xmldom=require("@xmldom/xmldom"),dom=require("@xmldom/xmldom/lib/dom");exports.parseFromString=parseFromString,exports.Node=dom.Node},{"@xmldom/xmldom":45,"@xmldom/xmldom/lib/dom":43}],40:[function(require,module,exports){function openArrayBuffer(arrayBuffer){return JSZip.loadAsync(arrayBuffer).then(function(zipFile){function exists(name){return null!==zipFile.file(name)}function read(name,encoding){return zipFile.file(name).async("uint8array").then(function(array){if("base64"===encoding)return base64js.fromByteArray(array);if(encoding){var decoder=new TextDecoder(encoding);return decoder.decode(array)}return array})}function write(name,contents){zipFile.file(name,contents)}function toArrayBuffer(){return zipFile.generateAsync({type:"arraybuffer"})}return{exists:exists,read:read,write:write,toArrayBuffer:toArrayBuffer}})}function splitPath(path){var lastIndex=path.lastIndexOf("/");return-1===lastIndex?{dirname:"",basename:path}:{dirname:path.substring(0,lastIndex),basename:path.substring(lastIndex+1)}}function joinPath(){var nonEmptyPaths=Array.prototype.filter.call(arguments,function(path){return path}),relevantPaths=[];return nonEmptyPaths.forEach(function(path){/^\//.test(path)?relevantPaths=[path]:relevantPaths.push(path)}),relevantPaths.join("/")}var base64js=require("base64-js"),JSZip=require("jszip");exports.openArrayBuffer=openArrayBuffer,exports.splitPath=splitPath,exports.joinPath=joinPath},{"base64-js":47,jszip:53}],41:[function(require,module,exports){"use strict";function find(list,predicate,ac){if(void 0===ac&&(ac=Array.prototype),list&&"function"==typeof ac.find)return ac.find.call(list,predicate);for(var i=0;i<list.length;i++)if(Object.prototype.hasOwnProperty.call(list,i)){var item=list[i];if(predicate.call(void 0,item,i,list))return item}}function freeze(object,oc){return void 0===oc&&(oc=Object),oc&&"function"==typeof oc.freeze?oc.freeze(object):object}function assign(target,source){if(null===target||"object"!=typeof target)throw new TypeError("target is not an object");for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key]);return target}var MIME_TYPE=freeze({HTML:"text/html",isHTML:function(value){return value===MIME_TYPE.HTML},XML_APPLICATION:"application/xml",XML_TEXT:"text/xml",XML_XHTML_APPLICATION:"application/xhtml+xml",XML_SVG_IMAGE:"image/svg+xml"}),NAMESPACE=freeze({HTML:"http://www.w3.org/1999/xhtml",isHTML:function(uri){return uri===NAMESPACE.HTML},SVG:"http://www.w3.org/2000/svg",XML:"http://www.w3.org/XML/1998/namespace",XMLNS:"http://www.w3.org/2000/xmlns/"});exports.assign=assign,exports.find=find,exports.freeze=freeze,exports.MIME_TYPE=MIME_TYPE,exports.NAMESPACE=NAMESPACE},{}],42:[function(require,module,exports){function normalizeLineEndings(input){return input.replace(/\r[\n\u0085]/g,"\n").replace(/[\r\u0085\u2028]/g,"\n");
}function DOMParser(options){this.options=options||{locator:{}}}function buildErrorHandler(errorImpl,domBuilder,locator){function build(key){var fn=errorImpl[key];!fn&&isCallback&&(fn=2==errorImpl.length?function(msg){errorImpl(key,msg)}:errorImpl),errorHandler[key]=fn&&function(msg){fn("[xmldom "+key+"]	"+msg+_locator(locator))}||function(){}}if(!errorImpl){if(domBuilder instanceof DOMHandler)return domBuilder;errorImpl=domBuilder}var errorHandler={},isCallback=errorImpl instanceof Function;return locator=locator||{},build("warning"),build("error"),build("fatalError"),errorHandler}function DOMHandler(){this.cdata=!1}function position(locator,node){node.lineNumber=locator.lineNumber,node.columnNumber=locator.columnNumber}function _locator(l){return l?"\n@"+(l.systemId||"")+"#[line:"+l.lineNumber+",col:"+l.columnNumber+"]":void 0}function _toString(chars,start,length){return"string"==typeof chars?chars.substr(start,length):chars.length>=start+length||start?new java.lang.String(chars,start,length)+"":chars}function appendElement(hander,node){hander.currentElement?hander.currentElement.appendChild(node):hander.doc.appendChild(node)}var conventions=require("./conventions"),dom=require("./dom"),entities=require("./entities"),sax=require("./sax"),DOMImplementation=dom.DOMImplementation,NAMESPACE=conventions.NAMESPACE,ParseError=sax.ParseError,XMLReader=sax.XMLReader;DOMParser.prototype.parseFromString=function(source,mimeType){var options=this.options,sax=new XMLReader,domBuilder=options.domBuilder||new DOMHandler,errorHandler=options.errorHandler,locator=options.locator,defaultNSMap=options.xmlns||{},isHTML=/\/x?html?$/.test(mimeType),entityMap=isHTML?entities.HTML_ENTITIES:entities.XML_ENTITIES;locator&&domBuilder.setDocumentLocator(locator),sax.errorHandler=buildErrorHandler(errorHandler,domBuilder,locator),sax.domBuilder=options.domBuilder||domBuilder,isHTML&&(defaultNSMap[""]=NAMESPACE.HTML),defaultNSMap.xml=defaultNSMap.xml||NAMESPACE.XML;var normalize=options.normalizeLineEndings||normalizeLineEndings;return source&&"string"==typeof source?sax.parse(normalize(source),defaultNSMap,entityMap):sax.errorHandler.error("invalid doc source"),domBuilder.doc},DOMHandler.prototype={startDocument:function(){this.doc=(new DOMImplementation).createDocument(null,null,null),this.locator&&(this.doc.documentURI=this.locator.systemId)},startElement:function(namespaceURI,localName,qName,attrs){var doc=this.doc,el=doc.createElementNS(namespaceURI,qName||localName),len=attrs.length;appendElement(this,el),this.currentElement=el,this.locator&&position(this.locator,el);for(var i=0;len>i;i++){var namespaceURI=attrs.getURI(i),value=attrs.getValue(i),qName=attrs.getQName(i),attr=doc.createAttributeNS(namespaceURI,qName);this.locator&&position(attrs.getLocator(i),attr),attr.value=attr.nodeValue=value,el.setAttributeNode(attr)}},endElement:function(namespaceURI,localName,qName){var current=this.currentElement;current.tagName;this.currentElement=current.parentNode},startPrefixMapping:function(prefix,uri){},endPrefixMapping:function(prefix){},processingInstruction:function(target,data){var ins=this.doc.createProcessingInstruction(target,data);this.locator&&position(this.locator,ins),appendElement(this,ins)},ignorableWhitespace:function(ch,start,length){},characters:function(chars,start,length){if(chars=_toString.apply(this,arguments)){if(this.cdata)var charNode=this.doc.createCDATASection(chars);else var charNode=this.doc.createTextNode(chars);this.currentElement?this.currentElement.appendChild(charNode):/^\s*$/.test(chars)&&this.doc.appendChild(charNode),this.locator&&position(this.locator,charNode)}},skippedEntity:function(name){},endDocument:function(){this.doc.normalize()},setDocumentLocator:function(locator){(this.locator=locator)&&(locator.lineNumber=0)},comment:function(chars,start,length){chars=_toString.apply(this,arguments);var comm=this.doc.createComment(chars);this.locator&&position(this.locator,comm),appendElement(this,comm)},startCDATA:function(){this.cdata=!0},endCDATA:function(){this.cdata=!1},startDTD:function(name,publicId,systemId){var impl=this.doc.implementation;if(impl&&impl.createDocumentType){var dt=impl.createDocumentType(name,publicId,systemId);this.locator&&position(this.locator,dt),appendElement(this,dt),this.doc.doctype=dt}},warning:function(error){console.warn("[xmldom warning]	"+error,_locator(this.locator))},error:function(error){console.error("[xmldom error]	"+error,_locator(this.locator))},fatalError:function(error){throw new ParseError(error,this.locator)}},"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){DOMHandler.prototype[key]=function(){return null}}),exports.__DOMHandler=DOMHandler,exports.normalizeLineEndings=normalizeLineEndings,exports.DOMParser=DOMParser},{"./conventions":41,"./dom":43,"./entities":44,"./sax":46}],43:[function(require,module,exports){function notEmptyString(input){return""!==input}function splitOnASCIIWhitespace(input){return input?input.split(/[\t\n\f\r ]+/).filter(notEmptyString):[]}function orderedSetReducer(current,element){return current.hasOwnProperty(element)||(current[element]=!0),current}function toOrderedSet(input){if(!input)return[];var list=splitOnASCIIWhitespace(input);return Object.keys(list.reduce(orderedSetReducer,{}))}function arrayIncludes(list){return function(element){return list&&-1!==list.indexOf(element)}}function copy(src,dest){for(var p in src)Object.prototype.hasOwnProperty.call(src,p)&&(dest[p]=src[p])}function _extends(Class,Super){function t(){}var pt=Class.prototype;pt instanceof Super||(t.prototype=Super.prototype,t=new t,copy(pt,t),Class.prototype=pt=t),pt.constructor!=Class&&("function"!=typeof Class&&console.error("unknown Class:"+Class),pt.constructor=Class)}function DOMException(code,message){if(message instanceof Error)var error=message;else error=this,Error.call(this,ExceptionMessage[code]),this.message=ExceptionMessage[code],Error.captureStackTrace&&Error.captureStackTrace(this,DOMException);return error.code=code,message&&(this.message=this.message+": "+message),error}function NodeList(){}function LiveNodeList(node,refresh){this._node=node,this._refresh=refresh,_updateLiveList(this)}function _updateLiveList(list){var inc=list._node._inc||list._node.ownerDocument._inc;if(list._inc!=inc){var ls=list._refresh(list._node);__set__(list,"length",ls.length),copy(ls,list),list._inc=inc}}function NamedNodeMap(){}function _findNodeIndex(list,node){for(var i=list.length;i--;)if(list[i]===node)return i}function _addNamedNode(el,list,newAttr,oldAttr){if(oldAttr?list[_findNodeIndex(list,oldAttr)]=newAttr:list[list.length++]=newAttr,el){newAttr.ownerElement=el;var doc=el.ownerDocument;doc&&(oldAttr&&_onRemoveAttribute(doc,el,oldAttr),_onAddAttribute(doc,el,newAttr))}}function _removeNamedNode(el,list,attr){var i=_findNodeIndex(list,attr);if(!(i>=0))throw new DOMException(NOT_FOUND_ERR,new Error(el.tagName+"@"+attr));for(var lastIndex=list.length-1;lastIndex>i;)list[i]=list[++i];if(list.length=lastIndex,el){var doc=el.ownerDocument;doc&&(_onRemoveAttribute(doc,el,attr),attr.ownerElement=null)}}function DOMImplementation(){}function Node(){}function _xmlEncoder(c){return"<"==c&&"&lt;"||">"==c&&"&gt;"||"&"==c&&"&amp;"||'"'==c&&"&quot;"||"&#"+c.charCodeAt()+";"}function _visitNode(node,callback){if(callback(node))return!0;if(node=node.firstChild)do if(_visitNode(node,callback))return!0;while(node=node.nextSibling)}function Document(){this.ownerDocument=this}function _onAddAttribute(doc,el,newAttr){doc&&doc._inc++;var ns=newAttr.namespaceURI;ns===NAMESPACE.XMLNS&&(el._nsMap[newAttr.prefix?newAttr.localName:""]=newAttr.value)}function _onRemoveAttribute(doc,el,newAttr,remove){doc&&doc._inc++;var ns=newAttr.namespaceURI;ns===NAMESPACE.XMLNS&&delete el._nsMap[newAttr.prefix?newAttr.localName:""]}function _onUpdateChild(doc,el,newChild){if(doc&&doc._inc){doc._inc++;var cs=el.childNodes;if(newChild)cs[cs.length++]=newChild;else{for(var child=el.firstChild,i=0;child;)cs[i++]=child,child=child.nextSibling;cs.length=i,delete cs[cs.length]}}}function _removeChild(parentNode,child){var previous=child.previousSibling,next=child.nextSibling;return previous?previous.nextSibling=next:parentNode.firstChild=next,next?next.previousSibling=previous:parentNode.lastChild=previous,child.parentNode=null,child.previousSibling=null,child.nextSibling=null,_onUpdateChild(parentNode.ownerDocument,parentNode),child}function hasValidParentNodeType(node){return node&&(node.nodeType===Node.DOCUMENT_NODE||node.nodeType===Node.DOCUMENT_FRAGMENT_NODE||node.nodeType===Node.ELEMENT_NODE)}function hasInsertableNodeType(node){return node&&(isElementNode(node)||isTextNode(node)||isDocTypeNode(node)||node.nodeType===Node.DOCUMENT_FRAGMENT_NODE||node.nodeType===Node.COMMENT_NODE||node.nodeType===Node.PROCESSING_INSTRUCTION_NODE)}function isDocTypeNode(node){return node&&node.nodeType===Node.DOCUMENT_TYPE_NODE}function isElementNode(node){return node&&node.nodeType===Node.ELEMENT_NODE}function isTextNode(node){return node&&node.nodeType===Node.TEXT_NODE}function isElementInsertionPossible(doc,child){var parentChildNodes=doc.childNodes||[];if(find(parentChildNodes,isElementNode)||isDocTypeNode(child))return!1;var docTypeNode=find(parentChildNodes,isDocTypeNode);return!(child&&docTypeNode&&parentChildNodes.indexOf(docTypeNode)>parentChildNodes.indexOf(child))}function isElementReplacementPossible(doc,child){function hasElementChildThatIsNotChild(node){return isElementNode(node)&&node!==child}var parentChildNodes=doc.childNodes||[];if(find(parentChildNodes,hasElementChildThatIsNotChild))return!1;var docTypeNode=find(parentChildNodes,isDocTypeNode);return!(child&&docTypeNode&&parentChildNodes.indexOf(docTypeNode)>parentChildNodes.indexOf(child))}function assertPreInsertionValidity1to5(parent,node,child){if(!hasValidParentNodeType(parent))throw new DOMException(HIERARCHY_REQUEST_ERR,"Unexpected parent node type "+parent.nodeType);if(child&&child.parentNode!==parent)throw new DOMException(NOT_FOUND_ERR,"child not in parent");if(!hasInsertableNodeType(node)||isDocTypeNode(node)&&parent.nodeType!==Node.DOCUMENT_NODE)throw new DOMException(HIERARCHY_REQUEST_ERR,"Unexpected node type "+node.nodeType+" for parent node type "+parent.nodeType)}function assertPreInsertionValidityInDocument(parent,node,child){var parentChildNodes=parent.childNodes||[],nodeChildNodes=node.childNodes||[];if(node.nodeType===Node.DOCUMENT_FRAGMENT_NODE){var nodeChildElements=nodeChildNodes.filter(isElementNode);if(nodeChildElements.length>1||find(nodeChildNodes,isTextNode))throw new DOMException(HIERARCHY_REQUEST_ERR,"More than one element or text in fragment");if(1===nodeChildElements.length&&!isElementInsertionPossible(parent,child))throw new DOMException(HIERARCHY_REQUEST_ERR,"Element in fragment can not be inserted before doctype")}if(isElementNode(node)&&!isElementInsertionPossible(parent,child))throw new DOMException(HIERARCHY_REQUEST_ERR,"Only one element can be added and only after doctype");if(isDocTypeNode(node)){if(find(parentChildNodes,isDocTypeNode))throw new DOMException(HIERARCHY_REQUEST_ERR,"Only one doctype is allowed");var parentElementChild=find(parentChildNodes,isElementNode);if(child&&parentChildNodes.indexOf(parentElementChild)<parentChildNodes.indexOf(child))throw new DOMException(HIERARCHY_REQUEST_ERR,"Doctype can only be inserted before an element");if(!child&&parentElementChild)throw new DOMException(HIERARCHY_REQUEST_ERR,"Doctype can not be appended since element is present")}}function assertPreReplacementValidityInDocument(parent,node,child){function hasDoctypeChildThatIsNotChild(node){return isDocTypeNode(node)&&node!==child}var parentChildNodes=parent.childNodes||[],nodeChildNodes=node.childNodes||[];if(node.nodeType===Node.DOCUMENT_FRAGMENT_NODE){var nodeChildElements=nodeChildNodes.filter(isElementNode);if(nodeChildElements.length>1||find(nodeChildNodes,isTextNode))throw new DOMException(HIERARCHY_REQUEST_ERR,"More than one element or text in fragment");if(1===nodeChildElements.length&&!isElementReplacementPossible(parent,child))throw new DOMException(HIERARCHY_REQUEST_ERR,"Element in fragment can not be inserted before doctype")}if(isElementNode(node)&&!isElementReplacementPossible(parent,child))throw new DOMException(HIERARCHY_REQUEST_ERR,"Only one element can be added and only after doctype");if(isDocTypeNode(node)){if(find(parentChildNodes,hasDoctypeChildThatIsNotChild))throw new DOMException(HIERARCHY_REQUEST_ERR,"Only one doctype is allowed");var parentElementChild=find(parentChildNodes,isElementNode);if(child&&parentChildNodes.indexOf(parentElementChild)<parentChildNodes.indexOf(child))throw new DOMException(HIERARCHY_REQUEST_ERR,"Doctype can only be inserted before an element")}}function _insertBefore(parent,node,child,_inDocumentAssertion){assertPreInsertionValidity1to5(parent,node,child),parent.nodeType===Node.DOCUMENT_NODE&&(_inDocumentAssertion||assertPreInsertionValidityInDocument)(parent,node,child);var cp=node.parentNode;if(cp&&cp.removeChild(node),node.nodeType===DOCUMENT_FRAGMENT_NODE){var newFirst=node.firstChild;if(null==newFirst)return node;var newLast=node.lastChild}else newFirst=newLast=node;var pre=child?child.previousSibling:parent.lastChild;newFirst.previousSibling=pre,newLast.nextSibling=child,pre?pre.nextSibling=newFirst:parent.firstChild=newFirst,null==child?parent.lastChild=newLast:child.previousSibling=newLast;do newFirst.parentNode=parent;while(newFirst!==newLast&&(newFirst=newFirst.nextSibling));return _onUpdateChild(parent.ownerDocument||parent,parent),node.nodeType==DOCUMENT_FRAGMENT_NODE&&(node.firstChild=node.lastChild=null),node}function _appendSingleChild(parentNode,newChild){return newChild.parentNode&&newChild.parentNode.removeChild(newChild),newChild.parentNode=parentNode,newChild.previousSibling=parentNode.lastChild,newChild.nextSibling=null,newChild.previousSibling?newChild.previousSibling.nextSibling=newChild:parentNode.firstChild=newChild,parentNode.lastChild=newChild,_onUpdateChild(parentNode.ownerDocument,parentNode,newChild),newChild}function Element(){this._nsMap={}}function Attr(){}function CharacterData(){}function Text(){}function Comment(){}function CDATASection(){}function DocumentType(){}function Notation(){}function Entity(){}function EntityReference(){}function DocumentFragment(){}function ProcessingInstruction(){}function XMLSerializer(){}function nodeSerializeToString(isHtml,nodeFilter){var buf=[],refNode=9==this.nodeType&&this.documentElement||this,prefix=refNode.prefix,uri=refNode.namespaceURI;if(uri&&null==prefix){var prefix=refNode.lookupPrefix(uri);if(null==prefix)var visibleNamespaces=[{namespace:uri,prefix:null}]}return serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces),buf.join("")}function needNamespaceDefine(node,isHTML,visibleNamespaces){var prefix=node.prefix||"",uri=node.namespaceURI;if(!uri)return!1;if("xml"===prefix&&uri===NAMESPACE.XML||uri===NAMESPACE.XMLNS)return!1;for(var i=visibleNamespaces.length;i--;){var ns=visibleNamespaces[i];if(ns.prefix===prefix)return ns.namespace!==uri}return!0}function addSerializedAttribute(buf,qualifiedName,value){buf.push(" ",qualifiedName,'="',value.replace(/[<>&"\t\n\r]/g,_xmlEncoder),'"')}function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){if(visibleNamespaces||(visibleNamespaces=[]),nodeFilter){if(node=nodeFilter(node),!node)return;if("string"==typeof node)return void buf.push(node)}switch(node.nodeType){case ELEMENT_NODE:var attrs=node.attributes,len=attrs.length,child=node.firstChild,nodeName=node.tagName;isHTML=NAMESPACE.isHTML(node.namespaceURI)||isHTML;var prefixedNodeName=nodeName;if(!isHTML&&!node.prefix&&node.namespaceURI){for(var defaultNS,ai=0;ai<attrs.length;ai++)if("xmlns"===attrs.item(ai).name){defaultNS=attrs.item(ai).value;break}if(!defaultNS)for(var nsi=visibleNamespaces.length-1;nsi>=0;nsi--){var namespace=visibleNamespaces[nsi];if(""===namespace.prefix&&namespace.namespace===node.namespaceURI){defaultNS=namespace.namespace;break}}if(defaultNS!==node.namespaceURI)for(var nsi=visibleNamespaces.length-1;nsi>=0;nsi--){var namespace=visibleNamespaces[nsi];if(namespace.namespace===node.namespaceURI){namespace.prefix&&(prefixedNodeName=namespace.prefix+":"+nodeName);break}}}buf.push("<",prefixedNodeName);for(var i=0;len>i;i++){var attr=attrs.item(i);"xmlns"==attr.prefix?visibleNamespaces.push({prefix:attr.localName,namespace:attr.value}):"xmlns"==attr.nodeName&&visibleNamespaces.push({prefix:"",namespace:attr.value})}for(var i=0;len>i;i++){var attr=attrs.item(i);if(needNamespaceDefine(attr,isHTML,visibleNamespaces)){var prefix=attr.prefix||"",uri=attr.namespaceURI;addSerializedAttribute(buf,prefix?"xmlns:"+prefix:"xmlns",uri),visibleNamespaces.push({prefix:prefix,namespace:uri})}serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces)}if(nodeName===prefixedNodeName&&needNamespaceDefine(node,isHTML,visibleNamespaces)){var prefix=node.prefix||"",uri=node.namespaceURI;addSerializedAttribute(buf,prefix?"xmlns:"+prefix:"xmlns",uri),visibleNamespaces.push({prefix:prefix,namespace:uri})}if(child||isHTML&&!/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){if(buf.push(">"),isHTML&&/^script$/i.test(nodeName))for(;child;)child.data?buf.push(child.data):serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces.slice()),child=child.nextSibling;else for(;child;)serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces.slice()),child=child.nextSibling;buf.push("</",prefixedNodeName,">")}else buf.push("/>");return;case DOCUMENT_NODE:case DOCUMENT_FRAGMENT_NODE:for(var child=node.firstChild;child;)serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces.slice()),child=child.nextSibling;return;case ATTRIBUTE_NODE:return addSerializedAttribute(buf,node.name,node.value);case TEXT_NODE:return buf.push(node.data.replace(/[<&>]/g,_xmlEncoder));case CDATA_SECTION_NODE:return buf.push("<![CDATA[",node.data,"]]>");case COMMENT_NODE:return buf.push("<!--",node.data,"-->");case DOCUMENT_TYPE_NODE:var pubid=node.publicId,sysid=node.systemId;if(buf.push("<!DOCTYPE ",node.name),pubid)buf.push(" PUBLIC ",pubid),sysid&&"."!=sysid&&buf.push(" ",sysid),buf.push(">");else if(sysid&&"."!=sysid)buf.push(" SYSTEM ",sysid,">");else{var sub=node.internalSubset;sub&&buf.push(" [",sub,"]"),buf.push(">")}return;case PROCESSING_INSTRUCTION_NODE:return buf.push("<?",node.target," ",node.data,"?>");case ENTITY_REFERENCE_NODE:return buf.push("&",node.nodeName,";");default:buf.push("??",node.nodeName)}}function importNode(doc,node,deep){var node2;switch(node.nodeType){case ELEMENT_NODE:node2=node.cloneNode(!1),node2.ownerDocument=doc;case DOCUMENT_FRAGMENT_NODE:break;case ATTRIBUTE_NODE:deep=!0}if(node2||(node2=node.cloneNode(!1)),node2.ownerDocument=doc,node2.parentNode=null,deep)for(var child=node.firstChild;child;)node2.appendChild(importNode(doc,child,deep)),child=child.nextSibling;return node2}function cloneNode(doc,node,deep){var node2=new node.constructor;for(var n in node)if(Object.prototype.hasOwnProperty.call(node,n)){var v=node[n];"object"!=typeof v&&v!=node2[n]&&(node2[n]=v)}switch(node.childNodes&&(node2.childNodes=new NodeList),node2.ownerDocument=doc,node2.nodeType){case ELEMENT_NODE:var attrs=node.attributes,attrs2=node2.attributes=new NamedNodeMap,len=attrs.length;attrs2._ownerElement=node2;for(var i=0;len>i;i++)node2.setAttributeNode(cloneNode(doc,attrs.item(i),!0));break;case ATTRIBUTE_NODE:deep=!0}if(deep)for(var child=node.firstChild;child;)node2.appendChild(cloneNode(doc,child,deep)),child=child.nextSibling;return node2}function __set__(object,key,value){object[key]=value}function getTextContent(node){switch(node.nodeType){case ELEMENT_NODE:case DOCUMENT_FRAGMENT_NODE:var buf=[];for(node=node.firstChild;node;)7!==node.nodeType&&8!==node.nodeType&&buf.push(getTextContent(node)),node=node.nextSibling;return buf.join("");default:return node.nodeValue}}var conventions=require("./conventions"),find=conventions.find,NAMESPACE=conventions.NAMESPACE,NodeType={},ELEMENT_NODE=NodeType.ELEMENT_NODE=1,ATTRIBUTE_NODE=NodeType.ATTRIBUTE_NODE=2,TEXT_NODE=NodeType.TEXT_NODE=3,CDATA_SECTION_NODE=NodeType.CDATA_SECTION_NODE=4,ENTITY_REFERENCE_NODE=NodeType.ENTITY_REFERENCE_NODE=5,ENTITY_NODE=NodeType.ENTITY_NODE=6,PROCESSING_INSTRUCTION_NODE=NodeType.PROCESSING_INSTRUCTION_NODE=7,COMMENT_NODE=NodeType.COMMENT_NODE=8,DOCUMENT_NODE=NodeType.DOCUMENT_NODE=9,DOCUMENT_TYPE_NODE=NodeType.DOCUMENT_TYPE_NODE=10,DOCUMENT_FRAGMENT_NODE=NodeType.DOCUMENT_FRAGMENT_NODE=11,NOTATION_NODE=NodeType.NOTATION_NODE=12,ExceptionCode={},ExceptionMessage={},HIERARCHY_REQUEST_ERR=(ExceptionCode.INDEX_SIZE_ERR=(ExceptionMessage[1]="Index size error",1),ExceptionCode.DOMSTRING_SIZE_ERR=(ExceptionMessage[2]="DOMString size error",2),ExceptionCode.HIERARCHY_REQUEST_ERR=(ExceptionMessage[3]="Hierarchy request error",3)),NOT_FOUND_ERR=(ExceptionCode.WRONG_DOCUMENT_ERR=(ExceptionMessage[4]="Wrong document",4),ExceptionCode.INVALID_CHARACTER_ERR=(ExceptionMessage[5]="Invalid character",5),ExceptionCode.NO_DATA_ALLOWED_ERR=(ExceptionMessage[6]="No data allowed",6),ExceptionCode.NO_MODIFICATION_ALLOWED_ERR=(ExceptionMessage[7]="No modification allowed",7),ExceptionCode.NOT_FOUND_ERR=(ExceptionMessage[8]="Not found",8)),INUSE_ATTRIBUTE_ERR=(ExceptionCode.NOT_SUPPORTED_ERR=(ExceptionMessage[9]="Not supported",9),ExceptionCode.INUSE_ATTRIBUTE_ERR=(ExceptionMessage[10]="Attribute in use",10));ExceptionCode.INVALID_STATE_ERR=(ExceptionMessage[11]="Invalid state",11),ExceptionCode.SYNTAX_ERR=(ExceptionMessage[12]="Syntax error",12),ExceptionCode.INVALID_MODIFICATION_ERR=(ExceptionMessage[13]="Invalid modification",13),ExceptionCode.NAMESPACE_ERR=(ExceptionMessage[14]="Invalid namespace",14),ExceptionCode.INVALID_ACCESS_ERR=(ExceptionMessage[15]="Invalid access",15);DOMException.prototype=Error.prototype,copy(ExceptionCode,DOMException),NodeList.prototype={length:0,item:function(index){return this[index]||null},toString:function(isHTML,nodeFilter){for(var buf=[],i=0;i<this.length;i++)serializeToString(this[i],buf,isHTML,nodeFilter);return buf.join("")},filter:function(predicate){return Array.prototype.filter.call(this,predicate)},indexOf:function(item){return Array.prototype.indexOf.call(this,item)}},LiveNodeList.prototype.item=function(i){return _updateLiveList(this),this[i]},_extends(LiveNodeList,NodeList),NamedNodeMap.prototype={length:0,item:NodeList.prototype.item,getNamedItem:function(key){for(var i=this.length;i--;){var attr=this[i];if(attr.nodeName==key)return attr}},setNamedItem:function(attr){var el=attr.ownerElement;if(el&&el!=this._ownerElement)throw new DOMException(INUSE_ATTRIBUTE_ERR);var oldAttr=this.getNamedItem(attr.nodeName);return _addNamedNode(this._ownerElement,this,attr,oldAttr),oldAttr},setNamedItemNS:function(attr){var oldAttr,el=attr.ownerElement;if(el&&el!=this._ownerElement)throw new DOMException(INUSE_ATTRIBUTE_ERR);return oldAttr=this.getNamedItemNS(attr.namespaceURI,attr.localName),_addNamedNode(this._ownerElement,this,attr,oldAttr),oldAttr},removeNamedItem:function(key){var attr=this.getNamedItem(key);return _removeNamedNode(this._ownerElement,this,attr),attr},removeNamedItemNS:function(namespaceURI,localName){var attr=this.getNamedItemNS(namespaceURI,localName);return _removeNamedNode(this._ownerElement,this,attr),attr},getNamedItemNS:function(namespaceURI,localName){for(var i=this.length;i--;){var node=this[i];if(node.localName==localName&&node.namespaceURI==namespaceURI)return node}return null}},DOMImplementation.prototype={hasFeature:function(feature,version){return!0},createDocument:function(namespaceURI,qualifiedName,doctype){var doc=new Document;if(doc.implementation=this,doc.childNodes=new NodeList,doc.doctype=doctype||null,doctype&&doc.appendChild(doctype),qualifiedName){var root=doc.createElementNS(namespaceURI,qualifiedName);doc.appendChild(root)}return doc},createDocumentType:function(qualifiedName,publicId,systemId){var node=new DocumentType;return node.name=qualifiedName,node.nodeName=qualifiedName,node.publicId=publicId||"",node.systemId=systemId||"",node}},Node.prototype={firstChild:null,lastChild:null,previousSibling:null,nextSibling:null,attributes:null,parentNode:null,childNodes:null,ownerDocument:null,nodeValue:null,namespaceURI:null,prefix:null,localName:null,insertBefore:function(newChild,refChild){return _insertBefore(this,newChild,refChild)},replaceChild:function(newChild,oldChild){_insertBefore(this,newChild,oldChild,assertPreReplacementValidityInDocument),oldChild&&this.removeChild(oldChild)},removeChild:function(oldChild){return _removeChild(this,oldChild)},appendChild:function(newChild){return this.insertBefore(newChild,null)},hasChildNodes:function(){return null!=this.firstChild},cloneNode:function(deep){return cloneNode(this.ownerDocument||this,this,deep)},normalize:function(){for(var child=this.firstChild;child;){var next=child.nextSibling;next&&next.nodeType==TEXT_NODE&&child.nodeType==TEXT_NODE?(this.removeChild(next),child.appendData(next.data)):(child.normalize(),child=next)}},isSupported:function(feature,version){return this.ownerDocument.implementation.hasFeature(feature,version)},hasAttributes:function(){return this.attributes.length>0},lookupPrefix:function(namespaceURI){for(var el=this;el;){var map=el._nsMap;if(map)for(var n in map)if(Object.prototype.hasOwnProperty.call(map,n)&&map[n]===namespaceURI)return n;el=el.nodeType==ATTRIBUTE_NODE?el.ownerDocument:el.parentNode}return null},lookupNamespaceURI:function(prefix){for(var el=this;el;){var map=el._nsMap;if(map&&Object.prototype.hasOwnProperty.call(map,prefix))return map[prefix];el=el.nodeType==ATTRIBUTE_NODE?el.ownerDocument:el.parentNode}return null},isDefaultNamespace:function(namespaceURI){var prefix=this.lookupPrefix(namespaceURI);return null==prefix}},copy(NodeType,Node),copy(NodeType,Node.prototype),Document.prototype={nodeName:"#document",nodeType:DOCUMENT_NODE,doctype:null,documentElement:null,_inc:1,insertBefore:function(newChild,refChild){if(newChild.nodeType==DOCUMENT_FRAGMENT_NODE){for(var child=newChild.firstChild;child;){var next=child.nextSibling;this.insertBefore(child,refChild),child=next}return newChild}return _insertBefore(this,newChild,refChild),newChild.ownerDocument=this,null===this.documentElement&&newChild.nodeType===ELEMENT_NODE&&(this.documentElement=newChild),newChild},removeChild:function(oldChild){return this.documentElement==oldChild&&(this.documentElement=null),_removeChild(this,oldChild)},replaceChild:function(newChild,oldChild){_insertBefore(this,newChild,oldChild,assertPreReplacementValidityInDocument),newChild.ownerDocument=this,oldChild&&this.removeChild(oldChild),isElementNode(newChild)&&(this.documentElement=newChild)},importNode:function(importedNode,deep){return importNode(this,importedNode,deep)},getElementById:function(id){var rtv=null;return _visitNode(this.documentElement,function(node){return node.nodeType==ELEMENT_NODE&&node.getAttribute("id")==id?(rtv=node,!0):void 0}),rtv},getElementsByClassName:function(classNames){var classNamesSet=toOrderedSet(classNames);return new LiveNodeList(this,function(base){var ls=[];return classNamesSet.length>0&&_visitNode(base.documentElement,function(node){if(node!==base&&node.nodeType===ELEMENT_NODE){var nodeClassNames=node.getAttribute("class");if(nodeClassNames){var matches=classNames===nodeClassNames;if(!matches){var nodeClassNamesSet=toOrderedSet(nodeClassNames);matches=classNamesSet.every(arrayIncludes(nodeClassNamesSet))}matches&&ls.push(node)}}}),ls})},createElement:function(tagName){var node=new Element;node.ownerDocument=this,node.nodeName=tagName,node.tagName=tagName,node.localName=tagName,node.childNodes=new NodeList;var attrs=node.attributes=new NamedNodeMap;return attrs._ownerElement=node,node},createDocumentFragment:function(){var node=new DocumentFragment;return node.ownerDocument=this,node.childNodes=new NodeList,node},createTextNode:function(data){var node=new Text;return node.ownerDocument=this,node.appendData(data),node},createComment:function(data){var node=new Comment;return node.ownerDocument=this,node.appendData(data),node},createCDATASection:function(data){var node=new CDATASection;return node.ownerDocument=this,node.appendData(data),node},createProcessingInstruction:function(target,data){var node=new ProcessingInstruction;return node.ownerDocument=this,node.tagName=node.target=target,node.nodeValue=node.data=data,node},createAttribute:function(name){var node=new Attr;return node.ownerDocument=this,node.name=name,node.nodeName=name,node.localName=name,node.specified=!0,node},createEntityReference:function(name){var node=new EntityReference;return node.ownerDocument=this,node.nodeName=name,node},createElementNS:function(namespaceURI,qualifiedName){var node=new Element,pl=qualifiedName.split(":"),attrs=node.attributes=new NamedNodeMap;return node.childNodes=new NodeList,node.ownerDocument=this,node.nodeName=qualifiedName,node.tagName=qualifiedName,node.namespaceURI=namespaceURI,2==pl.length?(node.prefix=pl[0],node.localName=pl[1]):node.localName=qualifiedName,attrs._ownerElement=node,node},createAttributeNS:function(namespaceURI,qualifiedName){var node=new Attr,pl=qualifiedName.split(":");return node.ownerDocument=this,node.nodeName=qualifiedName,node.name=qualifiedName,node.namespaceURI=namespaceURI,node.specified=!0,2==pl.length?(node.prefix=pl[0],node.localName=pl[1]):node.localName=qualifiedName,node}},_extends(Document,Node),Element.prototype={nodeType:ELEMENT_NODE,hasAttribute:function(name){return null!=this.getAttributeNode(name)},getAttribute:function(name){var attr=this.getAttributeNode(name);return attr&&attr.value||""},getAttributeNode:function(name){return this.attributes.getNamedItem(name)},setAttribute:function(name,value){var attr=this.ownerDocument.createAttribute(name);attr.value=attr.nodeValue=""+value,this.setAttributeNode(attr)},removeAttribute:function(name){var attr=this.getAttributeNode(name);attr&&this.removeAttributeNode(attr)},appendChild:function(newChild){return newChild.nodeType===DOCUMENT_FRAGMENT_NODE?this.insertBefore(newChild,null):_appendSingleChild(this,newChild)},setAttributeNode:function(newAttr){return this.attributes.setNamedItem(newAttr)},setAttributeNodeNS:function(newAttr){return this.attributes.setNamedItemNS(newAttr)},removeAttributeNode:function(oldAttr){return this.attributes.removeNamedItem(oldAttr.nodeName)},removeAttributeNS:function(namespaceURI,localName){var old=this.getAttributeNodeNS(namespaceURI,localName);old&&this.removeAttributeNode(old)},hasAttributeNS:function(namespaceURI,localName){return null!=this.getAttributeNodeNS(namespaceURI,localName)},getAttributeNS:function(namespaceURI,localName){var attr=this.getAttributeNodeNS(namespaceURI,localName);return attr&&attr.value||""},setAttributeNS:function(namespaceURI,qualifiedName,value){var attr=this.ownerDocument.createAttributeNS(namespaceURI,qualifiedName);attr.value=attr.nodeValue=""+value,this.setAttributeNode(attr)},getAttributeNodeNS:function(namespaceURI,localName){return this.attributes.getNamedItemNS(namespaceURI,localName)},getElementsByTagName:function(tagName){return new LiveNodeList(this,function(base){var ls=[];return _visitNode(base,function(node){node===base||node.nodeType!=ELEMENT_NODE||"*"!==tagName&&node.tagName!=tagName||ls.push(node)}),ls})},getElementsByTagNameNS:function(namespaceURI,localName){return new LiveNodeList(this,function(base){var ls=[];return _visitNode(base,function(node){node===base||node.nodeType!==ELEMENT_NODE||"*"!==namespaceURI&&node.namespaceURI!==namespaceURI||"*"!==localName&&node.localName!=localName||ls.push(node)}),ls})}},Document.prototype.getElementsByTagName=Element.prototype.getElementsByTagName,Document.prototype.getElementsByTagNameNS=Element.prototype.getElementsByTagNameNS,_extends(Element,Node),Attr.prototype.nodeType=ATTRIBUTE_NODE,_extends(Attr,Node),
CharacterData.prototype={data:"",substringData:function(offset,count){return this.data.substring(offset,offset+count)},appendData:function(text){text=this.data+text,this.nodeValue=this.data=text,this.length=text.length},insertData:function(offset,text){this.replaceData(offset,0,text)},appendChild:function(newChild){throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])},deleteData:function(offset,count){this.replaceData(offset,count,"")},replaceData:function(offset,count,text){var start=this.data.substring(0,offset),end=this.data.substring(offset+count);text=start+text+end,this.nodeValue=this.data=text,this.length=text.length}},_extends(CharacterData,Node),Text.prototype={nodeName:"#text",nodeType:TEXT_NODE,splitText:function(offset){var text=this.data,newText=text.substring(offset);text=text.substring(0,offset),this.data=this.nodeValue=text,this.length=text.length;var newNode=this.ownerDocument.createTextNode(newText);return this.parentNode&&this.parentNode.insertBefore(newNode,this.nextSibling),newNode}},_extends(Text,CharacterData),Comment.prototype={nodeName:"#comment",nodeType:COMMENT_NODE},_extends(Comment,CharacterData),CDATASection.prototype={nodeName:"#cdata-section",nodeType:CDATA_SECTION_NODE},_extends(CDATASection,CharacterData),DocumentType.prototype.nodeType=DOCUMENT_TYPE_NODE,_extends(DocumentType,Node),Notation.prototype.nodeType=NOTATION_NODE,_extends(Notation,Node),Entity.prototype.nodeType=ENTITY_NODE,_extends(Entity,Node),EntityReference.prototype.nodeType=ENTITY_REFERENCE_NODE,_extends(EntityReference,Node),DocumentFragment.prototype.nodeName="#document-fragment",DocumentFragment.prototype.nodeType=DOCUMENT_FRAGMENT_NODE,_extends(DocumentFragment,Node),ProcessingInstruction.prototype.nodeType=PROCESSING_INSTRUCTION_NODE,_extends(ProcessingInstruction,Node),XMLSerializer.prototype.serializeToString=function(node,isHtml,nodeFilter){return nodeSerializeToString.call(node,isHtml,nodeFilter)},Node.prototype.toString=nodeSerializeToString;try{Object.defineProperty&&(Object.defineProperty(LiveNodeList.prototype,"length",{get:function(){return _updateLiveList(this),this.$$length}}),Object.defineProperty(Node.prototype,"textContent",{get:function(){return getTextContent(this)},set:function(data){switch(this.nodeType){case ELEMENT_NODE:case DOCUMENT_FRAGMENT_NODE:for(;this.firstChild;)this.removeChild(this.firstChild);(data||String(data))&&this.appendChild(this.ownerDocument.createTextNode(data));break;default:this.data=data,this.value=data,this.nodeValue=data}}}),__set__=function(object,key,value){object["$$"+key]=value})}catch(e){}exports.DocumentType=DocumentType,exports.DOMException=DOMException,exports.DOMImplementation=DOMImplementation,exports.Element=Element,exports.Node=Node,exports.NodeList=NodeList,exports.XMLSerializer=XMLSerializer},{"./conventions":41}],44:[function(require,module,exports){var freeze=require("./conventions").freeze;exports.XML_ENTITIES=freeze({amp:"&",apos:"'",gt:">",lt:"<",quot:'"'}),exports.HTML_ENTITIES=freeze({lt:"<",gt:">",amp:"&",quot:'"',apos:"'",Agrave:"À",Aacute:"Á",Acirc:"Â",Atilde:"Ã",Auml:"Ä",Aring:"Å",AElig:"Æ",Ccedil:"Ç",Egrave:"È",Eacute:"É",Ecirc:"Ê",Euml:"Ë",Igrave:"Ì",Iacute:"Í",Icirc:"Î",Iuml:"Ï",ETH:"Ð",Ntilde:"Ñ",Ograve:"Ò",Oacute:"Ó",Ocirc:"Ô",Otilde:"Õ",Ouml:"Ö",Oslash:"Ø",Ugrave:"Ù",Uacute:"Ú",Ucirc:"Û",Uuml:"Ü",Yacute:"Ý",THORN:"Þ",szlig:"ß",agrave:"à",aacute:"á",acirc:"â",atilde:"ã",auml:"ä",aring:"å",aelig:"æ",ccedil:"ç",egrave:"è",eacute:"é",ecirc:"ê",euml:"ë",igrave:"ì",iacute:"í",icirc:"î",iuml:"ï",eth:"ð",ntilde:"ñ",ograve:"ò",oacute:"ó",ocirc:"ô",otilde:"õ",ouml:"ö",oslash:"ø",ugrave:"ù",uacute:"ú",ucirc:"û",uuml:"ü",yacute:"ý",thorn:"þ",yuml:"ÿ",nbsp:" ",iexcl:"¡",cent:"¢",pound:"£",curren:"¤",yen:"¥",brvbar:"¦",sect:"§",uml:"¨",copy:"©",ordf:"ª",laquo:"«",not:"¬",shy:"­­",reg:"®",macr:"¯",deg:"°",plusmn:"±",sup2:"²",sup3:"³",acute:"´",micro:"µ",para:"¶",middot:"·",cedil:"¸",sup1:"¹",ordm:"º",raquo:"»",frac14:"¼",frac12:"½",frac34:"¾",iquest:"¿",times:"×",divide:"÷",forall:"∀",part:"∂",exist:"∃",empty:"∅",nabla:"∇",isin:"∈",notin:"∉",ni:"∋",prod:"∏",sum:"∑",minus:"−",lowast:"∗",radic:"√",prop:"∝",infin:"∞",ang:"∠",and:"∧",or:"∨",cap:"∩",cup:"∪","int":"∫",there4:"∴",sim:"∼",cong:"≅",asymp:"≈",ne:"≠",equiv:"≡",le:"≤",ge:"≥",sub:"⊂",sup:"⊃",nsub:"⊄",sube:"⊆",supe:"⊇",oplus:"⊕",otimes:"⊗",perp:"⊥",sdot:"⋅",Alpha:"Α",Beta:"Β",Gamma:"Γ",Delta:"Δ",Epsilon:"Ε",Zeta:"Ζ",Eta:"Η",Theta:"Θ",Iota:"Ι",Kappa:"Κ",Lambda:"Λ",Mu:"Μ",Nu:"Ν",Xi:"Ξ",Omicron:"Ο",Pi:"Π",Rho:"Ρ",Sigma:"Σ",Tau:"Τ",Upsilon:"Υ",Phi:"Φ",Chi:"Χ",Psi:"Ψ",Omega:"Ω",alpha:"α",beta:"β",gamma:"γ",delta:"δ",epsilon:"ε",zeta:"ζ",eta:"η",theta:"θ",iota:"ι",kappa:"κ",lambda:"λ",mu:"μ",nu:"ν",xi:"ξ",omicron:"ο",pi:"π",rho:"ρ",sigmaf:"ς",sigma:"σ",tau:"τ",upsilon:"υ",phi:"φ",chi:"χ",psi:"ψ",omega:"ω",thetasym:"ϑ",upsih:"ϒ",piv:"ϖ",OElig:"Œ",oelig:"œ",Scaron:"Š",scaron:"š",Yuml:"Ÿ",fnof:"ƒ",circ:"ˆ",tilde:"˜",ensp:" ",emsp:" ",thinsp:" ",zwnj:"‌",zwj:"‍",lrm:"‎",rlm:"‏",ndash:"–",mdash:"—",lsquo:"‘",rsquo:"’",sbquo:"‚",ldquo:"“",rdquo:"”",bdquo:"„",dagger:"†",Dagger:"‡",bull:"•",hellip:"…",permil:"‰",prime:"′",Prime:"″",lsaquo:"‹",rsaquo:"›",oline:"‾",euro:"€",trade:"™",larr:"←",uarr:"↑",rarr:"→",darr:"↓",harr:"↔",crarr:"↵",lceil:"⌈",rceil:"⌉",lfloor:"⌊",rfloor:"⌋",loz:"◊",spades:"♠",clubs:"♣",hearts:"♥",diams:"♦"}),exports.entityMap=exports.HTML_ENTITIES},{"./conventions":41}],45:[function(require,module,exports){var dom=require("./dom");exports.DOMImplementation=dom.DOMImplementation,exports.XMLSerializer=dom.XMLSerializer,exports.DOMParser=require("./dom-parser").DOMParser},{"./dom":43,"./dom-parser":42}],46:[function(require,module,exports){function ParseError(message,locator){this.message=message,this.locator=locator,Error.captureStackTrace&&Error.captureStackTrace(this,ParseError)}function XMLReader(){}function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){function fixedFromCharCode(code){if(code>65535){code-=65536;var surrogate1=55296+(code>>10),surrogate2=56320+(1023&code);return String.fromCharCode(surrogate1,surrogate2)}return String.fromCharCode(code)}function entityReplacer(a){var k=a.slice(1,-1);return Object.hasOwnProperty.call(entityMap,k)?entityMap[k]:"#"===k.charAt(0)?fixedFromCharCode(parseInt(k.substr(1).replace("x","0x"))):(errorHandler.error("entity not found:"+a),a)}function appendText(end){if(end>start){var xt=source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);locator&&position(start),domBuilder.characters(xt,0,end-start),start=end}}function position(p,m){for(;p>=lineEnd&&(m=linePattern.exec(source));)lineStart=m.index,lineEnd=lineStart+m[0].length,locator.lineNumber++;locator.columnNumber=p-lineStart+1}for(var lineStart=0,lineEnd=0,linePattern=/.*(?:\r\n?|\n)|.*$/g,locator=domBuilder.locator,parseStack=[{currentNSMap:defaultNSMapCopy}],closeMap={},start=0;;){try{var tagStart=source.indexOf("<",start);if(0>tagStart){if(!source.substr(start).match(/^\s*$/)){var doc=domBuilder.doc,text=doc.createTextNode(source.substr(start));doc.appendChild(text),domBuilder.currentElement=text}return}switch(tagStart>start&&appendText(tagStart),source.charAt(tagStart+1)){case"/":var end=source.indexOf(">",tagStart+3),tagName=source.substring(tagStart+2,end).replace(/[ \t\n\r]+$/g,""),config=parseStack.pop();0>end?(tagName=source.substring(tagStart+2).replace(/[\s<].*/,""),errorHandler.error("end tag name: "+tagName+" is not complete:"+config.tagName),end=tagStart+1+tagName.length):tagName.match(/\s</)&&(tagName=tagName.replace(/[\s<].*/,""),errorHandler.error("end tag name: "+tagName+" maybe not complete"),end=tagStart+1+tagName.length);var localNSMap=config.localNSMap,endMatch=config.tagName==tagName,endIgnoreCaseMach=endMatch||config.tagName&&config.tagName.toLowerCase()==tagName.toLowerCase();if(endIgnoreCaseMach){if(domBuilder.endElement(config.uri,config.localName,tagName),localNSMap)for(var prefix in localNSMap)Object.prototype.hasOwnProperty.call(localNSMap,prefix)&&domBuilder.endPrefixMapping(prefix);endMatch||errorHandler.fatalError("end tag name: "+tagName+" is not match the current start tagName:"+config.tagName)}else parseStack.push(config);end++;break;case"?":locator&&position(tagStart),end=parseInstruction(source,tagStart,domBuilder);break;case"!":locator&&position(tagStart),end=parseDCC(source,tagStart,domBuilder,errorHandler);break;default:locator&&position(tagStart);var el=new ElementAttributes,currentNSMap=parseStack[parseStack.length-1].currentNSMap,end=parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler),len=el.length;if(!el.closed&&fixSelfClosed(source,end,el.tagName,closeMap)&&(el.closed=!0,entityMap.nbsp||errorHandler.warning("unclosed xml attribute")),locator&&len){for(var locator2=copyLocator(locator,{}),i=0;len>i;i++){var a=el[i];position(a.offset),a.locator=copyLocator(locator,{})}domBuilder.locator=locator2,appendElement(el,domBuilder,currentNSMap)&&parseStack.push(el),domBuilder.locator=locator}else appendElement(el,domBuilder,currentNSMap)&&parseStack.push(el);NAMESPACE.isHTML(el.uri)&&!el.closed?end=parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder):end++}}catch(e){if(e instanceof ParseError)throw e;errorHandler.error("element parse error: "+e),end=-1}end>start?start=end:appendText(Math.max(tagStart,start)+1)}}function copyLocator(f,t){return t.lineNumber=f.lineNumber,t.columnNumber=f.columnNumber,t}function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){function addAttribute(qname,value,startIndex){el.attributeNames.hasOwnProperty(qname)&&errorHandler.fatalError("Attribute "+qname+" redefined"),el.addValue(qname,value.replace(/[\t\n\r]/g," ").replace(/&#?\w+;/g,entityReplacer),startIndex)}for(var attrName,value,p=++start,s=S_TAG;;){var c=source.charAt(p);switch(c){case"=":if(s===S_ATTR)attrName=source.slice(start,p),s=S_EQ;else{if(s!==S_ATTR_SPACE)throw new Error("attribute equal must after attrName");s=S_EQ}break;case"'":case'"':if(s===S_EQ||s===S_ATTR){if(s===S_ATTR&&(errorHandler.warning('attribute value must after "="'),attrName=source.slice(start,p)),start=p+1,p=source.indexOf(c,start),!(p>0))throw new Error("attribute value no end '"+c+"' match");value=source.slice(start,p),addAttribute(attrName,value,start-1),s=S_ATTR_END}else{if(s!=S_ATTR_NOQUOT_VALUE)throw new Error('attribute value must after "="');value=source.slice(start,p),addAttribute(attrName,value,start),errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+")!!"),start=p+1,s=S_ATTR_END}break;case"/":switch(s){case S_TAG:el.setTagName(source.slice(start,p));case S_ATTR_END:case S_TAG_SPACE:case S_TAG_CLOSE:s=S_TAG_CLOSE,el.closed=!0;case S_ATTR_NOQUOT_VALUE:case S_ATTR:case S_ATTR_SPACE:break;default:throw new Error("attribute invalid close char('/')")}break;case"":return errorHandler.error("unexpected end of input"),s==S_TAG&&el.setTagName(source.slice(start,p)),p;case">":switch(s){case S_TAG:el.setTagName(source.slice(start,p));case S_ATTR_END:case S_TAG_SPACE:case S_TAG_CLOSE:break;case S_ATTR_NOQUOT_VALUE:case S_ATTR:value=source.slice(start,p),"/"===value.slice(-1)&&(el.closed=!0,value=value.slice(0,-1));case S_ATTR_SPACE:s===S_ATTR_SPACE&&(value=attrName),s==S_ATTR_NOQUOT_VALUE?(errorHandler.warning('attribute "'+value+'" missed quot(")!'),addAttribute(attrName,value,start)):(NAMESPACE.isHTML(currentNSMap[""])&&value.match(/^(?:disabled|checked|selected)$/i)||errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!'),addAttribute(value,value,start));break;case S_EQ:throw new Error("attribute value missed!!")}return p;case"":c=" ";default:if(" ">=c)switch(s){case S_TAG:el.setTagName(source.slice(start,p)),s=S_TAG_SPACE;break;case S_ATTR:attrName=source.slice(start,p),s=S_ATTR_SPACE;break;case S_ATTR_NOQUOT_VALUE:var value=source.slice(start,p);errorHandler.warning('attribute "'+value+'" missed quot(")!!'),addAttribute(attrName,value,start);case S_ATTR_END:s=S_TAG_SPACE}else switch(s){case S_ATTR_SPACE:el.tagName;NAMESPACE.isHTML(currentNSMap[""])&&attrName.match(/^(?:disabled|checked|selected)$/i)||errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!'),addAttribute(attrName,attrName,start),start=p,s=S_ATTR;break;case S_ATTR_END:errorHandler.warning('attribute space is required"'+attrName+'"!!');case S_TAG_SPACE:s=S_ATTR,start=p;break;case S_EQ:s=S_ATTR_NOQUOT_VALUE,start=p;break;case S_TAG_CLOSE:throw new Error("elements closed character '/' and '>' must be connected to")}}p++}}function appendElement(el,domBuilder,currentNSMap){for(var tagName=el.tagName,localNSMap=null,i=el.length;i--;){var a=el[i],qName=a.qName,value=a.value,nsp=qName.indexOf(":");if(nsp>0)var prefix=a.prefix=qName.slice(0,nsp),localName=qName.slice(nsp+1),nsPrefix="xmlns"===prefix&&localName;else localName=qName,prefix=null,nsPrefix="xmlns"===qName&&"";a.localName=localName,nsPrefix!==!1&&(null==localNSMap&&(localNSMap={},_copy(currentNSMap,currentNSMap={})),currentNSMap[nsPrefix]=localNSMap[nsPrefix]=value,a.uri=NAMESPACE.XMLNS,domBuilder.startPrefixMapping(nsPrefix,value))}for(var i=el.length;i--;){a=el[i];var prefix=a.prefix;prefix&&("xml"===prefix&&(a.uri=NAMESPACE.XML),"xmlns"!==prefix&&(a.uri=currentNSMap[prefix||""]))}var nsp=tagName.indexOf(":");nsp>0?(prefix=el.prefix=tagName.slice(0,nsp),localName=el.localName=tagName.slice(nsp+1)):(prefix=null,localName=el.localName=tagName);var ns=el.uri=currentNSMap[prefix||""];if(domBuilder.startElement(ns,localName,tagName,el),!el.closed)return el.currentNSMap=currentNSMap,el.localNSMap=localNSMap,!0;if(domBuilder.endElement(ns,localName,tagName),localNSMap)for(prefix in localNSMap)Object.prototype.hasOwnProperty.call(localNSMap,prefix)&&domBuilder.endPrefixMapping(prefix)}function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){if(/^(?:script|textarea)$/i.test(tagName)){var elEndStart=source.indexOf("</"+tagName+">",elStartEnd),text=source.substring(elStartEnd+1,elEndStart);if(/[&<]/.test(text))return/^script$/i.test(tagName)?(domBuilder.characters(text,0,text.length),elEndStart):(text=text.replace(/&#?\w+;/g,entityReplacer),domBuilder.characters(text,0,text.length),elEndStart)}return elStartEnd+1}function fixSelfClosed(source,elStartEnd,tagName,closeMap){var pos=closeMap[tagName];return null==pos&&(pos=source.lastIndexOf("</"+tagName+">"),elStartEnd>pos&&(pos=source.lastIndexOf("</"+tagName)),closeMap[tagName]=pos),elStartEnd>pos}function _copy(source,target){for(var n in source)Object.prototype.hasOwnProperty.call(source,n)&&(target[n]=source[n])}function parseDCC(source,start,domBuilder,errorHandler){var next=source.charAt(start+2);switch(next){case"-":if("-"===source.charAt(start+3)){var end=source.indexOf("-->",start+4);return end>start?(domBuilder.comment(source,start+4,end-start-4),end+3):(errorHandler.error("Unclosed comment"),-1)}return-1;default:if("CDATA["==source.substr(start+3,6)){var end=source.indexOf("]]>",start+9);return domBuilder.startCDATA(),domBuilder.characters(source,start+9,end-start-9),domBuilder.endCDATA(),end+3}var matchs=split(source,start),len=matchs.length;if(len>1&&/!doctype/i.test(matchs[0][0])){var name=matchs[1][0],pubid=!1,sysid=!1;len>3&&(/^public$/i.test(matchs[2][0])?(pubid=matchs[3][0],sysid=len>4&&matchs[4][0]):/^system$/i.test(matchs[2][0])&&(sysid=matchs[3][0]));var lastMatch=matchs[len-1];return domBuilder.startDTD(name,pubid,sysid),domBuilder.endDTD(),lastMatch.index+lastMatch[0].length}}return-1}function parseInstruction(source,start,domBuilder){var end=source.indexOf("?>",start);if(end){var match=source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);if(match){match[0].length;return domBuilder.processingInstruction(match[1],match[2]),end+2}return-1}return-1}function ElementAttributes(){this.attributeNames={}}function split(source,start){var match,buf=[],reg=/'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;for(reg.lastIndex=start,reg.exec(source);match=reg.exec(source);)if(buf.push(match),match[1])return buf}var NAMESPACE=require("./conventions").NAMESPACE,nameStartChar=/[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,nameChar=new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"),tagNamePattern=new RegExp("^"+nameStartChar.source+nameChar.source+"*(?::"+nameStartChar.source+nameChar.source+"*)?$"),S_TAG=0,S_ATTR=1,S_ATTR_SPACE=2,S_EQ=3,S_ATTR_NOQUOT_VALUE=4,S_ATTR_END=5,S_TAG_SPACE=6,S_TAG_CLOSE=7;ParseError.prototype=new Error,ParseError.prototype.name=ParseError.name,XMLReader.prototype={parse:function(source,defaultNSMap,entityMap){var domBuilder=this.domBuilder;domBuilder.startDocument(),_copy(defaultNSMap,defaultNSMap={}),parse(source,defaultNSMap,entityMap,domBuilder,this.errorHandler),domBuilder.endDocument()}},ElementAttributes.prototype={setTagName:function(tagName){if(!tagNamePattern.test(tagName))throw new Error("invalid tagName:"+tagName);this.tagName=tagName},addValue:function(qName,value,offset){if(!tagNamePattern.test(qName))throw new Error("invalid attribute:"+qName);this.attributeNames[qName]=this.length,this[this.length++]={qName:qName,value:value,offset:offset}},length:0,getLocalName:function(i){return this[i].localName},getLocator:function(i){return this[i].locator},getQName:function(i){return this[i].qName},getURI:function(i){return this[i].uri},getValue:function(i){return this[i].value}},exports.XMLReader=XMLReader,exports.ParseError=ParseError},{"./conventions":41}],47:[function(require,module,exports){"use strict";function getLens(b64){var len=b64.length;if(len%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var validLen=b64.indexOf("=");-1===validLen&&(validLen=len);var placeHoldersLen=validLen===len?0:4-validLen%4;return[validLen,placeHoldersLen]}function byteLength(b64){var lens=getLens(b64),validLen=lens[0],placeHoldersLen=lens[1];return 3*(validLen+placeHoldersLen)/4-placeHoldersLen}function _byteLength(b64,validLen,placeHoldersLen){return 3*(validLen+placeHoldersLen)/4-placeHoldersLen}function toByteArray(b64){var tmp,i,lens=getLens(b64),validLen=lens[0],placeHoldersLen=lens[1],arr=new Arr(_byteLength(b64,validLen,placeHoldersLen)),curByte=0,len=placeHoldersLen>0?validLen-4:validLen;for(i=0;len>i;i+=4)tmp=revLookup[b64.charCodeAt(i)]<<18|revLookup[b64.charCodeAt(i+1)]<<12|revLookup[b64.charCodeAt(i+2)]<<6|revLookup[b64.charCodeAt(i+3)],arr[curByte++]=tmp>>16&255,arr[curByte++]=tmp>>8&255,arr[curByte++]=255&tmp;return 2===placeHoldersLen&&(tmp=revLookup[b64.charCodeAt(i)]<<2|revLookup[b64.charCodeAt(i+1)]>>4,arr[curByte++]=255&tmp),1===placeHoldersLen&&(tmp=revLookup[b64.charCodeAt(i)]<<10|revLookup[b64.charCodeAt(i+1)]<<4|revLookup[b64.charCodeAt(i+2)]>>2,arr[curByte++]=tmp>>8&255,arr[curByte++]=255&tmp),arr}function tripletToBase64(num){return lookup[num>>18&63]+lookup[num>>12&63]+lookup[num>>6&63]+lookup[63&num]}function encodeChunk(uint8,start,end){for(var tmp,output=[],i=start;end>i;i+=3)tmp=(uint8[i]<<16&16711680)+(uint8[i+1]<<8&65280)+(255&uint8[i+2]),output.push(tripletToBase64(tmp));return output.join("")}function fromByteArray(uint8){for(var tmp,len=uint8.length,extraBytes=len%3,parts=[],maxChunkLength=16383,i=0,len2=len-extraBytes;len2>i;i+=maxChunkLength)parts.push(encodeChunk(uint8,i,i+maxChunkLength>len2?len2:i+maxChunkLength));return 1===extraBytes?(tmp=uint8[len-1],parts.push(lookup[tmp>>2]+lookup[tmp<<4&63]+"==")):2===extraBytes&&(tmp=(uint8[len-2]<<8)+uint8[len-1],parts.push(lookup[tmp>>10]+lookup[tmp>>4&63]+lookup[tmp<<2&63]+"=")),parts.join("")}exports.byteLength=byteLength,exports.toByteArray=toByteArray,exports.fromByteArray=fromByteArray;for(var lookup=[],revLookup=[],Arr="undefined"!=typeof Uint8Array?Uint8Array:Array,code="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",i=0,len=code.length;len>i;++i)lookup[i]=code[i],revLookup[code.charCodeAt(i)]=i;revLookup["-".charCodeAt(0)]=62,revLookup["_".charCodeAt(0)]=63},{}],48:[function(require,module,exports){(function(global){"use strict";function typedArraySupport(){try{var arr=new Uint8Array(1);return arr.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===arr.foo()&&"function"==typeof arr.subarray&&0===arr.subarray(1,1).byteLength}catch(e){return!1}}function kMaxLength(){return Buffer.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function createBuffer(that,length){if(kMaxLength()<length)throw new RangeError("Invalid typed array length");return Buffer.TYPED_ARRAY_SUPPORT?(that=new Uint8Array(length),that.__proto__=Buffer.prototype):(null===that&&(that=new Buffer(length)),that.length=length),that}function Buffer(arg,encodingOrOffset,length){if(!(Buffer.TYPED_ARRAY_SUPPORT||this instanceof Buffer))return new Buffer(arg,encodingOrOffset,length);if("number"==typeof arg){if("string"==typeof encodingOrOffset)throw new Error("If encoding is specified then the first argument must be a string");return allocUnsafe(this,arg)}return from(this,arg,encodingOrOffset,length)}function from(that,value,encodingOrOffset,length){if("number"==typeof value)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&value instanceof ArrayBuffer?fromArrayBuffer(that,value,encodingOrOffset,length):"string"==typeof value?fromString(that,value,encodingOrOffset):fromObject(that,value)}function assertSize(size){if("number"!=typeof size)throw new TypeError('"size" argument must be a number');if(0>size)throw new RangeError('"size" argument must not be negative')}function alloc(that,size,fill,encoding){return assertSize(size),0>=size?createBuffer(that,size):void 0!==fill?"string"==typeof encoding?createBuffer(that,size).fill(fill,encoding):createBuffer(that,size).fill(fill):createBuffer(that,size)}function allocUnsafe(that,size){if(assertSize(size),that=createBuffer(that,0>size?0:0|checked(size)),!Buffer.TYPED_ARRAY_SUPPORT)for(var i=0;size>i;++i)that[i]=0;return that}function fromString(that,string,encoding){if(("string"!=typeof encoding||""===encoding)&&(encoding="utf8"),!Buffer.isEncoding(encoding))throw new TypeError('"encoding" must be a valid string encoding');var length=0|byteLength(string,encoding);that=createBuffer(that,length);var actual=that.write(string,encoding);return actual!==length&&(that=that.slice(0,actual)),that}function fromArrayLike(that,array){var length=array.length<0?0:0|checked(array.length);that=createBuffer(that,length);for(var i=0;length>i;i+=1)that[i]=255&array[i];return that}function fromArrayBuffer(that,array,byteOffset,length){if(array.byteLength,0>byteOffset||array.byteLength<byteOffset)throw new RangeError("'offset' is out of bounds");if(array.byteLength<byteOffset+(length||0))throw new RangeError("'length' is out of bounds");return array=void 0===byteOffset&&void 0===length?new Uint8Array(array):void 0===length?new Uint8Array(array,byteOffset):new Uint8Array(array,byteOffset,length),Buffer.TYPED_ARRAY_SUPPORT?(that=array,that.__proto__=Buffer.prototype):that=fromArrayLike(that,array),that}function fromObject(that,obj){if(Buffer.isBuffer(obj)){var len=0|checked(obj.length);return that=createBuffer(that,len),0===that.length?that:(obj.copy(that,0,0,len),that)}if(obj){if("undefined"!=typeof ArrayBuffer&&obj.buffer instanceof ArrayBuffer||"length"in obj)return"number"!=typeof obj.length||isnan(obj.length)?createBuffer(that,0):fromArrayLike(that,obj);if("Buffer"===obj.type&&isArray(obj.data))return fromArrayLike(that,obj.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}function checked(length){if(length>=kMaxLength())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+kMaxLength().toString(16)+" bytes");return 0|length}function SlowBuffer(length){return+length!=length&&(length=0),Buffer.alloc(+length)}function byteLength(string,encoding){if(Buffer.isBuffer(string))return string.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(string)||string instanceof ArrayBuffer))return string.byteLength;"string"!=typeof string&&(string=""+string);var len=string.length;if(0===len)return 0;for(var loweredCase=!1;;)switch(encoding){case"ascii":case"latin1":case"binary":return len;case"utf8":case"utf-8":case void 0:return utf8ToBytes(string).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*len;case"hex":return len>>>1;case"base64":return base64ToBytes(string).length;default:if(loweredCase)return utf8ToBytes(string).length;encoding=(""+encoding).toLowerCase(),loweredCase=!0}}function slowToString(encoding,start,end){var loweredCase=!1;if((void 0===start||0>start)&&(start=0),start>this.length)return"";if((void 0===end||end>this.length)&&(end=this.length),0>=end)return"";if(end>>>=0,start>>>=0,start>=end)return"";for(encoding||(encoding="utf8");;)switch(encoding){case"hex":return hexSlice(this,start,end);case"utf8":case"utf-8":return utf8Slice(this,start,end);case"ascii":return asciiSlice(this,start,end);case"latin1":case"binary":return latin1Slice(this,start,end);case"base64":return base64Slice(this,start,end);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return utf16leSlice(this,start,end);default:if(loweredCase)throw new TypeError("Unknown encoding: "+encoding);encoding=(encoding+"").toLowerCase(),loweredCase=!0}}function swap(b,n,m){var i=b[n];b[n]=b[m],b[m]=i}function bidirectionalIndexOf(buffer,val,byteOffset,encoding,dir){if(0===buffer.length)return-1;if("string"==typeof byteOffset?(encoding=byteOffset,byteOffset=0):byteOffset>2147483647?byteOffset=2147483647:-2147483648>byteOffset&&(byteOffset=-2147483648),byteOffset=+byteOffset,isNaN(byteOffset)&&(byteOffset=dir?0:buffer.length-1),0>byteOffset&&(byteOffset=buffer.length+byteOffset),byteOffset>=buffer.length){if(dir)return-1;byteOffset=buffer.length-1}else if(0>byteOffset){if(!dir)return-1;byteOffset=0}if("string"==typeof val&&(val=Buffer.from(val,encoding)),Buffer.isBuffer(val))return 0===val.length?-1:arrayIndexOf(buffer,val,byteOffset,encoding,dir);if("number"==typeof val)return val=255&val,Buffer.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?dir?Uint8Array.prototype.indexOf.call(buffer,val,byteOffset):Uint8Array.prototype.lastIndexOf.call(buffer,val,byteOffset):arrayIndexOf(buffer,[val],byteOffset,encoding,dir);throw new TypeError("val must be string, number or Buffer")}function arrayIndexOf(arr,val,byteOffset,encoding,dir){function read(buf,i){return 1===indexSize?buf[i]:buf.readUInt16BE(i*indexSize)}var indexSize=1,arrLength=arr.length,valLength=val.length;if(void 0!==encoding&&(encoding=String(encoding).toLowerCase(),"ucs2"===encoding||"ucs-2"===encoding||"utf16le"===encoding||"utf-16le"===encoding)){if(arr.length<2||val.length<2)return-1;indexSize=2,arrLength/=2,valLength/=2,byteOffset/=2}var i;if(dir){var foundIndex=-1;for(i=byteOffset;arrLength>i;i++)if(read(arr,i)===read(val,-1===foundIndex?0:i-foundIndex)){if(-1===foundIndex&&(foundIndex=i),i-foundIndex+1===valLength)return foundIndex*indexSize}else-1!==foundIndex&&(i-=i-foundIndex),foundIndex=-1}else for(byteOffset+valLength>arrLength&&(byteOffset=arrLength-valLength),i=byteOffset;i>=0;i--){for(var found=!0,j=0;valLength>j;j++)if(read(arr,i+j)!==read(val,j)){found=!1;break}if(found)return i}return-1}function hexWrite(buf,string,offset,length){offset=Number(offset)||0;var remaining=buf.length-offset;length?(length=Number(length),length>remaining&&(length=remaining)):length=remaining;var strLen=string.length;if(strLen%2!==0)throw new TypeError("Invalid hex string");length>strLen/2&&(length=strLen/2);for(var i=0;length>i;++i){var parsed=parseInt(string.substr(2*i,2),16);if(isNaN(parsed))return i;buf[offset+i]=parsed}return i}function utf8Write(buf,string,offset,length){return blitBuffer(utf8ToBytes(string,buf.length-offset),buf,offset,length)}function asciiWrite(buf,string,offset,length){return blitBuffer(asciiToBytes(string),buf,offset,length)}function latin1Write(buf,string,offset,length){return asciiWrite(buf,string,offset,length)}function base64Write(buf,string,offset,length){return blitBuffer(base64ToBytes(string),buf,offset,length)}function ucs2Write(buf,string,offset,length){return blitBuffer(utf16leToBytes(string,buf.length-offset),buf,offset,length)}function base64Slice(buf,start,end){return 0===start&&end===buf.length?base64.fromByteArray(buf):base64.fromByteArray(buf.slice(start,end))}function utf8Slice(buf,start,end){end=Math.min(buf.length,end);for(var res=[],i=start;end>i;){var firstByte=buf[i],codePoint=null,bytesPerSequence=firstByte>239?4:firstByte>223?3:firstByte>191?2:1;if(end>=i+bytesPerSequence){var secondByte,thirdByte,fourthByte,tempCodePoint;switch(bytesPerSequence){case 1:128>firstByte&&(codePoint=firstByte);break;case 2:secondByte=buf[i+1],128===(192&secondByte)&&(tempCodePoint=(31&firstByte)<<6|63&secondByte,tempCodePoint>127&&(codePoint=tempCodePoint));break;case 3:secondByte=buf[i+1],thirdByte=buf[i+2],128===(192&secondByte)&&128===(192&thirdByte)&&(tempCodePoint=(15&firstByte)<<12|(63&secondByte)<<6|63&thirdByte,tempCodePoint>2047&&(55296>tempCodePoint||tempCodePoint>57343)&&(codePoint=tempCodePoint));break;case 4:secondByte=buf[i+1],thirdByte=buf[i+2],fourthByte=buf[i+3],128===(192&secondByte)&&128===(192&thirdByte)&&128===(192&fourthByte)&&(tempCodePoint=(15&firstByte)<<18|(63&secondByte)<<12|(63&thirdByte)<<6|63&fourthByte,tempCodePoint>65535&&1114112>tempCodePoint&&(codePoint=tempCodePoint))}}null===codePoint?(codePoint=65533,bytesPerSequence=1):codePoint>65535&&(codePoint-=65536,res.push(codePoint>>>10&1023|55296),codePoint=56320|1023&codePoint),res.push(codePoint),i+=bytesPerSequence}return decodeCodePointsArray(res)}function decodeCodePointsArray(codePoints){var len=codePoints.length;if(MAX_ARGUMENTS_LENGTH>=len)return String.fromCharCode.apply(String,codePoints);for(var res="",i=0;len>i;)res+=String.fromCharCode.apply(String,codePoints.slice(i,i+=MAX_ARGUMENTS_LENGTH));return res}function asciiSlice(buf,start,end){var ret="";end=Math.min(buf.length,end);for(var i=start;end>i;++i)ret+=String.fromCharCode(127&buf[i]);return ret}function latin1Slice(buf,start,end){var ret="";end=Math.min(buf.length,end);for(var i=start;end>i;++i)ret+=String.fromCharCode(buf[i]);return ret}function hexSlice(buf,start,end){var len=buf.length;(!start||0>start)&&(start=0),(!end||0>end||end>len)&&(end=len);for(var out="",i=start;end>i;++i)out+=toHex(buf[i]);return out}function utf16leSlice(buf,start,end){for(var bytes=buf.slice(start,end),res="",i=0;i<bytes.length;i+=2)res+=String.fromCharCode(bytes[i]+256*bytes[i+1]);return res}function checkOffset(offset,ext,length){if(offset%1!==0||0>offset)throw new RangeError("offset is not uint");if(offset+ext>length)throw new RangeError("Trying to access beyond buffer length")}function checkInt(buf,value,offset,ext,max,min){if(!Buffer.isBuffer(buf))throw new TypeError('"buffer" argument must be a Buffer instance');if(value>max||min>value)throw new RangeError('"value" argument is out of bounds');if(offset+ext>buf.length)throw new RangeError("Index out of range")}function objectWriteUInt16(buf,value,offset,littleEndian){0>value&&(value=65535+value+1);for(var i=0,j=Math.min(buf.length-offset,2);j>i;++i)buf[offset+i]=(value&255<<8*(littleEndian?i:1-i))>>>8*(littleEndian?i:1-i)}function objectWriteUInt32(buf,value,offset,littleEndian){0>value&&(value=4294967295+value+1);for(var i=0,j=Math.min(buf.length-offset,4);j>i;++i)buf[offset+i]=value>>>8*(littleEndian?i:3-i)&255}function checkIEEE754(buf,value,offset,ext,max,min){if(offset+ext>buf.length)throw new RangeError("Index out of range");if(0>offset)throw new RangeError("Index out of range")}function writeFloat(buf,value,offset,littleEndian,noAssert){return noAssert||checkIEEE754(buf,value,offset,4,3.4028234663852886e38,-3.4028234663852886e38),ieee754.write(buf,value,offset,littleEndian,23,4),offset+4}function writeDouble(buf,value,offset,littleEndian,noAssert){
return noAssert||checkIEEE754(buf,value,offset,8,1.7976931348623157e308,-1.7976931348623157e308),ieee754.write(buf,value,offset,littleEndian,52,8),offset+8}function base64clean(str){if(str=stringtrim(str).replace(INVALID_BASE64_RE,""),str.length<2)return"";for(;str.length%4!==0;)str+="=";return str}function stringtrim(str){return str.trim?str.trim():str.replace(/^\s+|\s+$/g,"")}function toHex(n){return 16>n?"0"+n.toString(16):n.toString(16)}function utf8ToBytes(string,units){units=units||1/0;for(var codePoint,length=string.length,leadSurrogate=null,bytes=[],i=0;length>i;++i){if(codePoint=string.charCodeAt(i),codePoint>55295&&57344>codePoint){if(!leadSurrogate){if(codePoint>56319){(units-=3)>-1&&bytes.push(239,191,189);continue}if(i+1===length){(units-=3)>-1&&bytes.push(239,191,189);continue}leadSurrogate=codePoint;continue}if(56320>codePoint){(units-=3)>-1&&bytes.push(239,191,189),leadSurrogate=codePoint;continue}codePoint=(leadSurrogate-55296<<10|codePoint-56320)+65536}else leadSurrogate&&(units-=3)>-1&&bytes.push(239,191,189);if(leadSurrogate=null,128>codePoint){if((units-=1)<0)break;bytes.push(codePoint)}else if(2048>codePoint){if((units-=2)<0)break;bytes.push(codePoint>>6|192,63&codePoint|128)}else if(65536>codePoint){if((units-=3)<0)break;bytes.push(codePoint>>12|224,codePoint>>6&63|128,63&codePoint|128)}else{if(!(1114112>codePoint))throw new Error("Invalid code point");if((units-=4)<0)break;bytes.push(codePoint>>18|240,codePoint>>12&63|128,codePoint>>6&63|128,63&codePoint|128)}}return bytes}function asciiToBytes(str){for(var byteArray=[],i=0;i<str.length;++i)byteArray.push(255&str.charCodeAt(i));return byteArray}function utf16leToBytes(str,units){for(var c,hi,lo,byteArray=[],i=0;i<str.length&&!((units-=2)<0);++i)c=str.charCodeAt(i),hi=c>>8,lo=c%256,byteArray.push(lo),byteArray.push(hi);return byteArray}function base64ToBytes(str){return base64.toByteArray(base64clean(str))}function blitBuffer(src,dst,offset,length){for(var i=0;length>i&&!(i+offset>=dst.length||i>=src.length);++i)dst[i+offset]=src[i];return i}function isnan(val){return val!==val}var base64=require("base64-js"),ieee754=require("ieee754"),isArray=require("isarray");exports.Buffer=Buffer,exports.SlowBuffer=SlowBuffer,exports.INSPECT_MAX_BYTES=50,Buffer.TYPED_ARRAY_SUPPORT=void 0!==global.TYPED_ARRAY_SUPPORT?global.TYPED_ARRAY_SUPPORT:typedArraySupport(),exports.kMaxLength=kMaxLength(),Buffer.poolSize=8192,Buffer._augment=function(arr){return arr.__proto__=Buffer.prototype,arr},Buffer.from=function(value,encodingOrOffset,length){return from(null,value,encodingOrOffset,length)},Buffer.TYPED_ARRAY_SUPPORT&&(Buffer.prototype.__proto__=Uint8Array.prototype,Buffer.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&Buffer[Symbol.species]===Buffer&&Object.defineProperty(Buffer,Symbol.species,{value:null,configurable:!0})),Buffer.alloc=function(size,fill,encoding){return alloc(null,size,fill,encoding)},Buffer.allocUnsafe=function(size){return allocUnsafe(null,size)},Buffer.allocUnsafeSlow=function(size){return allocUnsafe(null,size)},Buffer.isBuffer=function(b){return!(null==b||!b._isBuffer)},Buffer.compare=function(a,b){if(!Buffer.isBuffer(a)||!Buffer.isBuffer(b))throw new TypeError("Arguments must be Buffers");if(a===b)return 0;for(var x=a.length,y=b.length,i=0,len=Math.min(x,y);len>i;++i)if(a[i]!==b[i]){x=a[i],y=b[i];break}return y>x?-1:x>y?1:0},Buffer.isEncoding=function(encoding){switch(String(encoding).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},Buffer.concat=function(list,length){if(!isArray(list))throw new TypeError('"list" argument must be an Array of Buffers');if(0===list.length)return Buffer.alloc(0);var i;if(void 0===length)for(length=0,i=0;i<list.length;++i)length+=list[i].length;var buffer=Buffer.allocUnsafe(length),pos=0;for(i=0;i<list.length;++i){var buf=list[i];if(!Buffer.isBuffer(buf))throw new TypeError('"list" argument must be an Array of Buffers');buf.copy(buffer,pos),pos+=buf.length}return buffer},Buffer.byteLength=byteLength,Buffer.prototype._isBuffer=!0,Buffer.prototype.swap16=function(){var len=this.length;if(len%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var i=0;len>i;i+=2)swap(this,i,i+1);return this},Buffer.prototype.swap32=function(){var len=this.length;if(len%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var i=0;len>i;i+=4)swap(this,i,i+3),swap(this,i+1,i+2);return this},Buffer.prototype.swap64=function(){var len=this.length;if(len%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var i=0;len>i;i+=8)swap(this,i,i+7),swap(this,i+1,i+6),swap(this,i+2,i+5),swap(this,i+3,i+4);return this},Buffer.prototype.toString=function(){var length=0|this.length;return 0===length?"":0===arguments.length?utf8Slice(this,0,length):slowToString.apply(this,arguments)},Buffer.prototype.equals=function(b){if(!Buffer.isBuffer(b))throw new TypeError("Argument must be a Buffer");return this===b?!0:0===Buffer.compare(this,b)},Buffer.prototype.inspect=function(){var str="",max=exports.INSPECT_MAX_BYTES;return this.length>0&&(str=this.toString("hex",0,max).match(/.{2}/g).join(" "),this.length>max&&(str+=" ... ")),"<Buffer "+str+">"},Buffer.prototype.compare=function(target,start,end,thisStart,thisEnd){if(!Buffer.isBuffer(target))throw new TypeError("Argument must be a Buffer");if(void 0===start&&(start=0),void 0===end&&(end=target?target.length:0),void 0===thisStart&&(thisStart=0),void 0===thisEnd&&(thisEnd=this.length),0>start||end>target.length||0>thisStart||thisEnd>this.length)throw new RangeError("out of range index");if(thisStart>=thisEnd&&start>=end)return 0;if(thisStart>=thisEnd)return-1;if(start>=end)return 1;if(start>>>=0,end>>>=0,thisStart>>>=0,thisEnd>>>=0,this===target)return 0;for(var x=thisEnd-thisStart,y=end-start,len=Math.min(x,y),thisCopy=this.slice(thisStart,thisEnd),targetCopy=target.slice(start,end),i=0;len>i;++i)if(thisCopy[i]!==targetCopy[i]){x=thisCopy[i],y=targetCopy[i];break}return y>x?-1:x>y?1:0},Buffer.prototype.includes=function(val,byteOffset,encoding){return-1!==this.indexOf(val,byteOffset,encoding)},Buffer.prototype.indexOf=function(val,byteOffset,encoding){return bidirectionalIndexOf(this,val,byteOffset,encoding,!0)},Buffer.prototype.lastIndexOf=function(val,byteOffset,encoding){return bidirectionalIndexOf(this,val,byteOffset,encoding,!1)},Buffer.prototype.write=function(string,offset,length,encoding){if(void 0===offset)encoding="utf8",length=this.length,offset=0;else if(void 0===length&&"string"==typeof offset)encoding=offset,length=this.length,offset=0;else{if(!isFinite(offset))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");offset=0|offset,isFinite(length)?(length=0|length,void 0===encoding&&(encoding="utf8")):(encoding=length,length=void 0)}var remaining=this.length-offset;if((void 0===length||length>remaining)&&(length=remaining),string.length>0&&(0>length||0>offset)||offset>this.length)throw new RangeError("Attempt to write outside buffer bounds");encoding||(encoding="utf8");for(var loweredCase=!1;;)switch(encoding){case"hex":return hexWrite(this,string,offset,length);case"utf8":case"utf-8":return utf8Write(this,string,offset,length);case"ascii":return asciiWrite(this,string,offset,length);case"latin1":case"binary":return latin1Write(this,string,offset,length);case"base64":return base64Write(this,string,offset,length);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return ucs2Write(this,string,offset,length);default:if(loweredCase)throw new TypeError("Unknown encoding: "+encoding);encoding=(""+encoding).toLowerCase(),loweredCase=!0}},Buffer.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var MAX_ARGUMENTS_LENGTH=4096;Buffer.prototype.slice=function(start,end){var len=this.length;start=~~start,end=void 0===end?len:~~end,0>start?(start+=len,0>start&&(start=0)):start>len&&(start=len),0>end?(end+=len,0>end&&(end=0)):end>len&&(end=len),start>end&&(end=start);var newBuf;if(Buffer.TYPED_ARRAY_SUPPORT)newBuf=this.subarray(start,end),newBuf.__proto__=Buffer.prototype;else{var sliceLen=end-start;newBuf=new Buffer(sliceLen,void 0);for(var i=0;sliceLen>i;++i)newBuf[i]=this[i+start]}return newBuf},Buffer.prototype.readUIntLE=function(offset,byteLength,noAssert){offset=0|offset,byteLength=0|byteLength,noAssert||checkOffset(offset,byteLength,this.length);for(var val=this[offset],mul=1,i=0;++i<byteLength&&(mul*=256);)val+=this[offset+i]*mul;return val},Buffer.prototype.readUIntBE=function(offset,byteLength,noAssert){offset=0|offset,byteLength=0|byteLength,noAssert||checkOffset(offset,byteLength,this.length);for(var val=this[offset+--byteLength],mul=1;byteLength>0&&(mul*=256);)val+=this[offset+--byteLength]*mul;return val},Buffer.prototype.readUInt8=function(offset,noAssert){return noAssert||checkOffset(offset,1,this.length),this[offset]},Buffer.prototype.readUInt16LE=function(offset,noAssert){return noAssert||checkOffset(offset,2,this.length),this[offset]|this[offset+1]<<8},Buffer.prototype.readUInt16BE=function(offset,noAssert){return noAssert||checkOffset(offset,2,this.length),this[offset]<<8|this[offset+1]},Buffer.prototype.readUInt32LE=function(offset,noAssert){return noAssert||checkOffset(offset,4,this.length),(this[offset]|this[offset+1]<<8|this[offset+2]<<16)+16777216*this[offset+3]},Buffer.prototype.readUInt32BE=function(offset,noAssert){return noAssert||checkOffset(offset,4,this.length),16777216*this[offset]+(this[offset+1]<<16|this[offset+2]<<8|this[offset+3])},Buffer.prototype.readIntLE=function(offset,byteLength,noAssert){offset=0|offset,byteLength=0|byteLength,noAssert||checkOffset(offset,byteLength,this.length);for(var val=this[offset],mul=1,i=0;++i<byteLength&&(mul*=256);)val+=this[offset+i]*mul;return mul*=128,val>=mul&&(val-=Math.pow(2,8*byteLength)),val},Buffer.prototype.readIntBE=function(offset,byteLength,noAssert){offset=0|offset,byteLength=0|byteLength,noAssert||checkOffset(offset,byteLength,this.length);for(var i=byteLength,mul=1,val=this[offset+--i];i>0&&(mul*=256);)val+=this[offset+--i]*mul;return mul*=128,val>=mul&&(val-=Math.pow(2,8*byteLength)),val},Buffer.prototype.readInt8=function(offset,noAssert){return noAssert||checkOffset(offset,1,this.length),128&this[offset]?-1*(255-this[offset]+1):this[offset]},Buffer.prototype.readInt16LE=function(offset,noAssert){noAssert||checkOffset(offset,2,this.length);var val=this[offset]|this[offset+1]<<8;return 32768&val?4294901760|val:val},Buffer.prototype.readInt16BE=function(offset,noAssert){noAssert||checkOffset(offset,2,this.length);var val=this[offset+1]|this[offset]<<8;return 32768&val?4294901760|val:val},Buffer.prototype.readInt32LE=function(offset,noAssert){return noAssert||checkOffset(offset,4,this.length),this[offset]|this[offset+1]<<8|this[offset+2]<<16|this[offset+3]<<24},Buffer.prototype.readInt32BE=function(offset,noAssert){return noAssert||checkOffset(offset,4,this.length),this[offset]<<24|this[offset+1]<<16|this[offset+2]<<8|this[offset+3]},Buffer.prototype.readFloatLE=function(offset,noAssert){return noAssert||checkOffset(offset,4,this.length),ieee754.read(this,offset,!0,23,4)},Buffer.prototype.readFloatBE=function(offset,noAssert){return noAssert||checkOffset(offset,4,this.length),ieee754.read(this,offset,!1,23,4)},Buffer.prototype.readDoubleLE=function(offset,noAssert){return noAssert||checkOffset(offset,8,this.length),ieee754.read(this,offset,!0,52,8)},Buffer.prototype.readDoubleBE=function(offset,noAssert){return noAssert||checkOffset(offset,8,this.length),ieee754.read(this,offset,!1,52,8)},Buffer.prototype.writeUIntLE=function(value,offset,byteLength,noAssert){if(value=+value,offset=0|offset,byteLength=0|byteLength,!noAssert){var maxBytes=Math.pow(2,8*byteLength)-1;checkInt(this,value,offset,byteLength,maxBytes,0)}var mul=1,i=0;for(this[offset]=255&value;++i<byteLength&&(mul*=256);)this[offset+i]=value/mul&255;return offset+byteLength},Buffer.prototype.writeUIntBE=function(value,offset,byteLength,noAssert){if(value=+value,offset=0|offset,byteLength=0|byteLength,!noAssert){var maxBytes=Math.pow(2,8*byteLength)-1;checkInt(this,value,offset,byteLength,maxBytes,0)}var i=byteLength-1,mul=1;for(this[offset+i]=255&value;--i>=0&&(mul*=256);)this[offset+i]=value/mul&255;return offset+byteLength},Buffer.prototype.writeUInt8=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,1,255,0),Buffer.TYPED_ARRAY_SUPPORT||(value=Math.floor(value)),this[offset]=255&value,offset+1},Buffer.prototype.writeUInt16LE=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,2,65535,0),Buffer.TYPED_ARRAY_SUPPORT?(this[offset]=255&value,this[offset+1]=value>>>8):objectWriteUInt16(this,value,offset,!0),offset+2},Buffer.prototype.writeUInt16BE=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,2,65535,0),Buffer.TYPED_ARRAY_SUPPORT?(this[offset]=value>>>8,this[offset+1]=255&value):objectWriteUInt16(this,value,offset,!1),offset+2},Buffer.prototype.writeUInt32LE=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,4,4294967295,0),Buffer.TYPED_ARRAY_SUPPORT?(this[offset+3]=value>>>24,this[offset+2]=value>>>16,this[offset+1]=value>>>8,this[offset]=255&value):objectWriteUInt32(this,value,offset,!0),offset+4},Buffer.prototype.writeUInt32BE=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,4,4294967295,0),Buffer.TYPED_ARRAY_SUPPORT?(this[offset]=value>>>24,this[offset+1]=value>>>16,this[offset+2]=value>>>8,this[offset+3]=255&value):objectWriteUInt32(this,value,offset,!1),offset+4},Buffer.prototype.writeIntLE=function(value,offset,byteLength,noAssert){if(value=+value,offset=0|offset,!noAssert){var limit=Math.pow(2,8*byteLength-1);checkInt(this,value,offset,byteLength,limit-1,-limit)}var i=0,mul=1,sub=0;for(this[offset]=255&value;++i<byteLength&&(mul*=256);)0>value&&0===sub&&0!==this[offset+i-1]&&(sub=1),this[offset+i]=(value/mul>>0)-sub&255;return offset+byteLength},Buffer.prototype.writeIntBE=function(value,offset,byteLength,noAssert){if(value=+value,offset=0|offset,!noAssert){var limit=Math.pow(2,8*byteLength-1);checkInt(this,value,offset,byteLength,limit-1,-limit)}var i=byteLength-1,mul=1,sub=0;for(this[offset+i]=255&value;--i>=0&&(mul*=256);)0>value&&0===sub&&0!==this[offset+i+1]&&(sub=1),this[offset+i]=(value/mul>>0)-sub&255;return offset+byteLength},Buffer.prototype.writeInt8=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,1,127,-128),Buffer.TYPED_ARRAY_SUPPORT||(value=Math.floor(value)),0>value&&(value=255+value+1),this[offset]=255&value,offset+1},Buffer.prototype.writeInt16LE=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,2,32767,-32768),Buffer.TYPED_ARRAY_SUPPORT?(this[offset]=255&value,this[offset+1]=value>>>8):objectWriteUInt16(this,value,offset,!0),offset+2},Buffer.prototype.writeInt16BE=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,2,32767,-32768),Buffer.TYPED_ARRAY_SUPPORT?(this[offset]=value>>>8,this[offset+1]=255&value):objectWriteUInt16(this,value,offset,!1),offset+2},Buffer.prototype.writeInt32LE=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,4,2147483647,-2147483648),Buffer.TYPED_ARRAY_SUPPORT?(this[offset]=255&value,this[offset+1]=value>>>8,this[offset+2]=value>>>16,this[offset+3]=value>>>24):objectWriteUInt32(this,value,offset,!0),offset+4},Buffer.prototype.writeInt32BE=function(value,offset,noAssert){return value=+value,offset=0|offset,noAssert||checkInt(this,value,offset,4,2147483647,-2147483648),0>value&&(value=4294967295+value+1),Buffer.TYPED_ARRAY_SUPPORT?(this[offset]=value>>>24,this[offset+1]=value>>>16,this[offset+2]=value>>>8,this[offset+3]=255&value):objectWriteUInt32(this,value,offset,!1),offset+4},Buffer.prototype.writeFloatLE=function(value,offset,noAssert){return writeFloat(this,value,offset,!0,noAssert)},Buffer.prototype.writeFloatBE=function(value,offset,noAssert){return writeFloat(this,value,offset,!1,noAssert)},Buffer.prototype.writeDoubleLE=function(value,offset,noAssert){return writeDouble(this,value,offset,!0,noAssert)},Buffer.prototype.writeDoubleBE=function(value,offset,noAssert){return writeDouble(this,value,offset,!1,noAssert)},Buffer.prototype.copy=function(target,targetStart,start,end){if(start||(start=0),end||0===end||(end=this.length),targetStart>=target.length&&(targetStart=target.length),targetStart||(targetStart=0),end>0&&start>end&&(end=start),end===start)return 0;if(0===target.length||0===this.length)return 0;if(0>targetStart)throw new RangeError("targetStart out of bounds");if(0>start||start>=this.length)throw new RangeError("sourceStart out of bounds");if(0>end)throw new RangeError("sourceEnd out of bounds");end>this.length&&(end=this.length),target.length-targetStart<end-start&&(end=target.length-targetStart+start);var i,len=end-start;if(this===target&&targetStart>start&&end>targetStart)for(i=len-1;i>=0;--i)target[i+targetStart]=this[i+start];else if(1e3>len||!Buffer.TYPED_ARRAY_SUPPORT)for(i=0;len>i;++i)target[i+targetStart]=this[i+start];else Uint8Array.prototype.set.call(target,this.subarray(start,start+len),targetStart);return len},Buffer.prototype.fill=function(val,start,end,encoding){if("string"==typeof val){if("string"==typeof start?(encoding=start,start=0,end=this.length):"string"==typeof end&&(encoding=end,end=this.length),1===val.length){var code=val.charCodeAt(0);256>code&&(val=code)}if(void 0!==encoding&&"string"!=typeof encoding)throw new TypeError("encoding must be a string");if("string"==typeof encoding&&!Buffer.isEncoding(encoding))throw new TypeError("Unknown encoding: "+encoding)}else"number"==typeof val&&(val=255&val);if(0>start||this.length<start||this.length<end)throw new RangeError("Out of range index");if(start>=end)return this;start>>>=0,end=void 0===end?this.length:end>>>0,val||(val=0);var i;if("number"==typeof val)for(i=start;end>i;++i)this[i]=val;else{var bytes=Buffer.isBuffer(val)?val:utf8ToBytes(new Buffer(val,encoding).toString()),len=bytes.length;for(i=0;end-start>i;++i)this[i+start]=bytes[i%len]}return this};var INVALID_BASE64_RE=/[^+\/0-9A-Za-z-_]/g}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"base64-js":47,ieee754:51,isarray:52}],49:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var dingbats={SYMBOL:{32:32,33:33,34:8704,35:35,36:8707,37:37,38:38,39:8717,40:40,41:41,42:42,43:43,44:44,45:8722,46:46,47:47,48:48,49:49,50:50,51:51,52:52,53:53,54:54,55:55,56:56,57:57,58:58,59:59,60:60,61:61,62:62,63:63,64:8773,65:913,66:914,67:935,68:916,69:917,70:934,71:915,72:919,73:921,74:977,75:922,76:923,77:924,78:925,79:927,80:928,81:920,82:929,83:931,84:932,85:933,86:962,87:937,88:926,89:936,90:918,91:91,92:8756,93:93,94:8869,95:95,96:8254,97:945,98:946,99:967,100:948,101:949,102:966,103:947,104:951,105:953,106:981,107:954,108:955,109:956,110:957,111:959,112:960,113:952,114:961,115:963,116:964,117:965,118:982,119:969,120:958,121:968,122:950,123:123,124:124,125:125,126:126,160:8364,161:978,162:8242,163:8804,164:8260,165:8734,166:402,167:9827,168:9830,169:9829,170:9824,171:8596,172:8592,173:8593,174:8594,175:8595,176:176,177:177,178:8243,179:8805,180:215,181:8733,182:8706,183:8226,184:247,185:8800,186:8801,187:8776,188:8230,189:9168,190:9135,191:8629,192:8501,193:8465,194:8476,195:8472,196:8855,197:8853,198:8709,199:8745,200:8746,201:8835,202:8839,203:8836,204:8834,205:8838,206:8712,207:8713,208:8736,209:8711,210:174,211:169,212:8482,213:8719,214:8730,215:8901,216:172,217:8743,218:8744,219:8660,220:8656,221:8657,222:8658,223:8659,224:9674,225:12296,226:174,227:169,228:8482,229:8721,230:9115,231:9116,232:9117,233:9121,234:9122,235:9123,236:9127,237:9128,238:9129,239:9130,240:63743,241:12297,242:8747,243:8992,244:9134,245:8993,246:9118,247:9119,248:9120,249:9124,250:9125,251:9126,252:9131,253:9132,254:9133},WEBDINGS:{32:32,33:128375,34:128376,35:128370,36:128374,37:127942,38:127894,39:128391,40:128488,41:128489,42:128496,43:128497,44:127798,45:127895,46:128638,47:128636,48:128469,49:128470,50:128471,51:9204,52:9205,53:9206,54:9207,55:9194,56:9193,57:9198,58:9197,59:9208,60:9209,61:9210,62:128474,63:128499,64:128736,65:127959,66:127960,67:127961,68:127962,69:127964,70:127981,71:127963,72:127968,73:127958,74:127965,75:128739,76:128269,77:127956,78:128065,79:128066,80:127966,81:127957,82:128740,83:127967,84:128755,85:128364,86:128363,87:128360,88:128264,89:127892,90:127893,91:128492,92:128637,93:128493,94:128490,95:128491,96:11156,97:10004,98:128690,99:11036,100:128737,101:128230,102:128753,103:11035,104:128657,105:128712,106:128745,107:128752,108:128968,109:128372,110:11044,111:128741,112:128660,113:128472,114:128473,115:10067,116:128754,117:128647,118:128653,119:9971,120:10680,121:8854,122:128685,123:128494,124:9168,125:128495,126:128498,128:128697,129:128698,130:128713,131:128714,132:128700,133:128125,134:127947,135:9975,136:127938,137:127948,138:127946,139:127940,140:127949,141:127950,142:128664,143:128480,144:128738,145:128176,146:127991,147:128179,148:128106,149:128481,150:128482,151:128483,152:10031,153:128388,154:128389,155:128387,156:128390,157:128441,158:128442,159:128443,160:128373,161:128368,162:128445,163:128446,164:128203,165:128466,166:128467,167:128366,168:128218,169:128478,170:128479,171:128451,172:128450,173:128444,174:127917,175:127900,176:127896,177:127897,178:127911,179:128191,180:127902,181:128247,182:127903,183:127916,184:128253,185:128249,186:128254,187:128251,188:127898,189:127899,190:128250,191:128187,192:128421,193:128422,194:128423,195:128377,196:127918,197:128379,198:128380,199:128223,200:128385,201:128384,202:128424,203:128425,204:128447,205:128426,206:128476,207:128274,208:128275,209:128477,210:128229,211:128228,212:128371,213:127779,214:127780,215:127781,216:127782,217:9729,218:127784,219:127783,220:127785,221:127786,222:127788,223:127787,224:127772,225:127777,226:128715,227:128719,228:127869,229:127864,230:128718,231:128717,232:9413,233:9855,234:128710,235:128392,236:127891,237:128484,238:128485,239:128486,240:128487,241:128746,242:128063,243:128038,244:128031,245:128021,246:128008,247:128620,248:128622,249:128621,250:128623,251:128506,252:127757,253:127759,254:127758,255:128330},WINGDINGS:{32:32,33:128393,34:9986,35:9985,36:128083,37:128365,38:128366,39:128367,40:128383,41:9990,42:128386,43:128387,44:128234,45:128235,46:128236,47:128237,48:128448,49:128449,50:128462,51:128463,52:128464,53:128452,54:8987,55:128430,56:128432,57:128434,58:128435,59:128436,60:128427,61:128428,62:9991,63:9997,64:128398,65:9996,66:128399,67:128077,68:128078,69:9756,70:9758,71:9757,72:9759,73:128400,74:9786,75:128528,76:9785,77:128163,78:128369,79:127987,80:127985,81:9992,82:9788,83:127778,84:10052,85:128326,86:10014,87:128328,88:10016,89:10017,90:9770,91:9775,92:128329,93:9784,94:9800,95:9801,96:9802,97:9803,98:9804,99:9805,100:9806,101:9807,102:9808,103:9809,104:9810,105:9811,106:128624,107:128629,108:9899,109:128318,110:9724,111:128911,112:128912,113:10065,114:10066,115:128927,116:10731,117:9670,118:10070,119:11049,120:8999,121:11193,122:8984,123:127989,124:127990,125:128630,126:128631,127:9647,128:127243,129:10112,130:10113,131:10114,132:10115,133:10116,134:10117,135:10118,136:10119,137:10120,138:10121,139:127244,140:10122,141:10123,142:10124,143:10125,144:10126,145:10127,146:10128,147:10129,148:10130,149:10131,150:128610,151:128608,152:128609,153:128611,154:128606,155:128604,156:128605,157:128607,158:8729,159:8226,160:11037,161:11096,162:128902,163:128904,164:128906,165:128907,166:128319,167:9642,168:128910,169:128961,170:128965,171:9733,172:128971,173:128975,174:128979,175:128977,176:11216,177:8982,178:11214,179:11215,180:11217,181:10026,182:10032,183:128336,184:128337,185:128338,186:128339,187:128340,188:128341,189:128342,190:128343,191:128344,192:128345,193:128346,194:128347,195:11184,196:11185,197:11186,198:11187,199:11188,200:11189,201:11190,202:11191,203:128618,204:128619,205:128597,206:128596,207:128599,208:128598,209:128592,210:128593,211:128594,212:128595,213:9003,214:8998,215:11160,216:11162,217:11161,218:11163,219:11144,220:11146,221:11145,222:11147,223:129128,224:129130,225:129129,226:129131,227:129132,228:129133,229:129135,230:129134,231:129144,232:129146,233:129145,234:129147,235:129148,236:129149,237:129151,238:129150,239:8678,240:8680,241:8679,242:8681,243:11012,244:8691,245:11009,246:11008,247:11011,248:11010,249:129196,250:129197,251:128502,252:10003,253:128503,254:128505},"WINGDINGS 2":{32:32,33:128394,34:128395,35:128396,36:128397,37:9988,38:9984,39:128382,40:128381,41:128453,42:128454,43:128455,44:128456,45:128457,46:128458,47:128459,48:128460,49:128461,50:128203,51:128465,52:128468,53:128437,54:128438,55:128439,56:128440,57:128429,58:128431,59:128433,60:128402,61:128403,62:128408,63:128409,64:128410,65:128411,66:128072,67:128073,68:128412,69:128413,70:128414,71:128415,72:128416,73:128417,74:128070,75:128071,76:128418,77:128419,78:128401,79:128500,80:128504,81:128501,82:9745,83:11197,84:9746,85:11198,86:11199,87:128711,88:10680,89:128625,90:128628,91:128626,92:128627,93:8253,94:128633,95:128634,96:128635,97:128614,98:128612,99:128613,100:128615,101:128602,102:128600,103:128601,104:128603,105:9450,106:9312,107:9313,108:9314,109:9315,110:9316,111:9317,112:9318,113:9319,114:9320,115:9321,116:9471,117:10102,118:10103,119:10104,120:10105,121:10106,122:10107,123:10108,124:10109,125:10110,126:10111,128:9737,129:127765,130:9789,131:9790,132:11839,133:10013,134:128327,135:128348,136:128349,137:128350,138:128351,139:128352,140:128353,141:128354,142:128355,143:128356,144:128357,145:128358,146:128359,147:128616,148:128617,149:8901,150:128900,151:10625,152:9679,153:9675,154:128901,155:128903,156:128905,157:8857,158:10687,159:128908,160:128909,161:9726,162:9632,163:9633,164:128913,165:128914,166:128915,167:128916,168:9635,169:128917,170:128918,171:128919,172:128920,173:11049,174:11045,175:9671,176:128922,177:9672,178:128923,179:128924,180:128925,181:128926,182:11050,183:11047,184:9674,185:128928,186:9686,187:9687,188:11210,189:11211,190:11200,191:11201,192:11039,193:11202,194:11043,195:11042,196:11203,197:11204,198:128929,199:128930,200:128931,201:128932,202:128933,203:128934,204:128935,205:128936,206:128937,207:128938,208:128939,209:128940,210:128941,211:128942,212:128943,213:128944,214:128945,215:128946,216:128947,217:128948,218:128949,219:128950,220:128951,221:128952,222:128953,223:128954,224:128955,225:128956,226:128957,227:128958,228:128959,229:128960,230:128962,231:128964,232:128966,233:128969,234:128970,235:10038,236:128972,237:128974,238:128976,239:128978,240:10041,241:128963,242:128967,243:10031,244:128973,245:128980,246:11212,247:11213,248:8251,249:8258},"WINGDINGS 3":{32:32,33:11104,34:11106,35:11105,36:11107,37:11110,38:11111,39:11113,40:11112,41:11120,42:11122,43:11121,44:11123,45:11126,46:11128,47:11131,48:11133,49:11108,50:11109,51:11114,52:11116,53:11115,54:11117,55:11085,56:11168,57:11169,58:11170,59:11171,60:11172,61:11173,62:11174,63:11175,64:11152,65:11153,66:11154,67:11155,68:11136,69:11139,70:11134,71:11135,72:11140,73:11142,74:11141,75:11143,76:11151,77:11149,78:11150,79:11148,80:11118,81:11119,82:9099,83:8996,84:8963,85:8997,86:9251,87:9085,88:8682,89:11192,90:129184,91:129185,92:129186,93:129187,94:129188,95:129189,96:129190,97:129191,98:129192,99:129193,100:129194,101:129195,102:129104,103:129106,104:129105,105:129107,106:129108,107:129109,108:129111,109:129110,110:129112,111:129113,112:9650,113:9660,114:9651,115:9661,116:9664,117:9654,118:9665,119:9655,120:9699,121:9698,122:9700,123:9701,124:128896,125:128898,126:128897,128:128899,129:11205,130:11206,131:11207,132:11208,133:11164,134:11166,135:11165,136:11167,137:129040,138:129042,139:129041,140:129043,141:129044,142:129046,143:129045,144:129047,145:129048,146:129050,147:129049,148:129051,149:129052,150:129054,151:129053,152:129055,153:129024,154:129026,155:129025,156:129027,157:129028,158:129030,159:129029,160:129031,161:129032,162:129034,163:129033,164:129035,165:129056,166:129058,167:129060,168:129062,169:129064,170:129066,171:129068,172:129180,173:129181,174:129182,175:129183,176:129070,177:129072,178:129074,179:129076,180:129078,181:129080,182:129082,183:129081,184:129083,185:129176,186:129178,187:129177,188:129179,189:129084,190:129086,191:129085,192:129087,193:129088,194:129090,195:129089,196:129091,197:129092,198:129094,199:129093,200:129095,201:11176,202:11177,203:11178,204:11179,205:11180,206:11181,207:11182,208:11183,209:129120,210:129122,211:129121,212:129123,213:129124,214:129125,215:129127,216:129126,217:129136,218:129138,219:129137,220:129139,221:129140,222:129141,223:129143,224:129142,225:129152,226:129154,227:129153,228:129155,229:129156,230:129157,231:129159,232:129158,233:129168,234:129170,235:129169,236:129171,237:129172,238:129174,239:129173,240:129175}};exports["default"]=dingbats},{}],50:[function(require,module,exports){"use strict";function codePoint(typeface,codePoint){var codePointMap=dingbats_1["default"][typeface.toUpperCase()];if(void 0===codePointMap)return void 0;var unicodeCodePoint=codePointMap[codePoint];return void 0===unicodeCodePoint?void 0:{codePoint:unicodeCodePoint,string:fromCodePoint(unicodeCodePoint)}}function dec(typeface,dec){return codePoint(typeface,parseInt(dec,10))}function hex(typeface,hex){return codePoint(typeface,parseInt(hex,16))}function fromCodePointPolyfill(codePoint){if(65535>=codePoint)return String.fromCharCode(codePoint);var highSurrogate=Math.floor((codePoint-65536)/1024)+55296,lowSurrogate=(codePoint-65536)%1024+56320;return String.fromCharCode(highSurrogate,lowSurrogate)}var __importDefault=this&&this.__importDefault||function(mod){return mod&&mod.__esModule?mod:{"default":mod}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.hex=exports.dec=exports.codePoint=void 0;var dingbats_1=__importDefault(require("./dingbats")),fromCodePoint=String.fromCodePoint?String.fromCodePoint:fromCodePointPolyfill;exports.codePoint=codePoint,exports.dec=dec,exports.hex=hex},{"./dingbats":49}],51:[function(require,module,exports){exports.read=function(buffer,offset,isLE,mLen,nBytes){var e,m,eLen=8*nBytes-mLen-1,eMax=(1<<eLen)-1,eBias=eMax>>1,nBits=-7,i=isLE?nBytes-1:0,d=isLE?-1:1,s=buffer[offset+i];for(i+=d,e=s&(1<<-nBits)-1,s>>=-nBits,nBits+=eLen;nBits>0;e=256*e+buffer[offset+i],i+=d,nBits-=8);for(m=e&(1<<-nBits)-1,e>>=-nBits,nBits+=mLen;nBits>0;m=256*m+buffer[offset+i],i+=d,nBits-=8);if(0===e)e=1-eBias;else{if(e===eMax)return m?NaN:(s?-1:1)*(1/0);m+=Math.pow(2,mLen),e-=eBias}return(s?-1:1)*m*Math.pow(2,e-mLen)},exports.write=function(buffer,value,offset,isLE,mLen,nBytes){var e,m,c,eLen=8*nBytes-mLen-1,eMax=(1<<eLen)-1,eBias=eMax>>1,rt=23===mLen?Math.pow(2,-24)-Math.pow(2,-77):0,i=isLE?0:nBytes-1,d=isLE?1:-1,s=0>value||0===value&&0>1/value?1:0;for(value=Math.abs(value),isNaN(value)||value===1/0?(m=isNaN(value)?1:0,e=eMax):(e=Math.floor(Math.log(value)/Math.LN2),value*(c=Math.pow(2,-e))<1&&(e--,c*=2),value+=e+eBias>=1?rt/c:rt*Math.pow(2,1-eBias),value*c>=2&&(e++,c/=2),e+eBias>=eMax?(m=0,e=eMax):e+eBias>=1?(m=(value*c-1)*Math.pow(2,mLen),e+=eBias):(m=value*Math.pow(2,eBias-1)*Math.pow(2,mLen),e=0));mLen>=8;buffer[offset+i]=255&m,i+=d,m/=256,mLen-=8);for(e=e<<mLen|m,eLen+=mLen;eLen>0;buffer[offset+i]=255&e,i+=d,e/=256,eLen-=8);buffer[offset+i-d]|=128*s}},{}],52:[function(require,module,exports){var toString={}.toString;module.exports=Array.isArray||function(arr){return"[object Array]"==toString.call(arr)}},{}],53:[function(require,module,exports){(function(global,Buffer){!function(t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).JSZip=t();
}(function(){return function s(a,o,h){function u(r,t){if(!o[r]){if(!a[r]){var e="function"==typeof require&&require;if(!t&&e)return e(r,!0);if(l)return l(r,!0);var i=new Error("Cannot find module '"+r+"'");throw i.code="MODULE_NOT_FOUND",i}var n=o[r]={exports:{}};a[r][0].call(n.exports,function(t){var e=a[r][1][t];return u(e||t)},n,n.exports,s,a,o,h)}return o[r].exports}for(var l="function"==typeof require&&require,t=0;t<h.length;t++)u(h[t]);return u}({1:[function(t,e,r){"use strict";var c=t("./utils"),d=t("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(t){for(var e,r,i,n,s,a,o,h=[],u=0,l=t.length,f=l,d="string"!==c.getTypeOf(t);u<t.length;)f=l-u,i=d?(e=t[u++],r=l>u?t[u++]:0,l>u?t[u++]:0):(e=t.charCodeAt(u++),r=l>u?t.charCodeAt(u++):0,l>u?t.charCodeAt(u++):0),n=e>>2,s=(3&e)<<4|r>>4,a=f>1?(15&r)<<2|i>>6:64,o=f>2?63&i:64,h.push(p.charAt(n)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(t){var e,r,i,n,s,a,o=0,h=0,u="data:";if(t.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(t=t.replace(/[^A-Za-z0-9\+\/\=]/g,"")).length/4;if(t.charAt(t.length-1)===p.charAt(64)&&f--,t.charAt(t.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=d.uint8array?new Uint8Array(0|f):new Array(0|f);o<t.length;)e=p.indexOf(t.charAt(o++))<<2|(n=p.indexOf(t.charAt(o++)))>>4,r=(15&n)<<4|(s=p.indexOf(t.charAt(o++)))>>2,i=(3&s)<<6|(a=p.indexOf(t.charAt(o++))),l[h++]=e,64!==s&&(l[h++]=r),64!==a&&(l[h++]=i);return l}},{"./support":30,"./utils":32}],2:[function(t,e,r){"use strict";function o(t,e,r,i,n){this.compressedSize=t,this.uncompressedSize=e,this.crc32=r,this.compression=i,this.compressedContent=n}var i=t("./external"),n=t("./stream/DataWorker"),s=t("./stream/Crc32Probe"),a=t("./stream/DataLengthProbe");o.prototype={getContentWorker:function(){var t=new n(i.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),e=this;return t.on("end",function(){if(this.streamInfo.data_length!==e.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),t},getCompressedWorker:function(){return new n(i.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(t,e,r){return t.pipe(new s).pipe(new a("uncompressedSize")).pipe(e.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression",e)},e.exports=o},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(t,e,r){"use strict";var i=t("./stream/GenericWorker");r.STORE={magic:"\x00\x00",compressWorker:function(t){return new i("STORE compression")},uncompressWorker:function(){return new i("STORE decompression")}},r.DEFLATE=t("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(t,e,r){"use strict";var i=t("./utils"),o=function(){for(var t,e=[],r=0;256>r;r++){t=r;for(var i=0;8>i;i++)t=1&t?3988292384^t>>>1:t>>>1;e[r]=t}return e}();e.exports=function(t,e){return void 0!==t&&t.length?"string"!==i.getTypeOf(t)?function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;s>a;a++)t=t>>>8^n[255&(t^e[a])];return-1^t}(0|e,t,t.length,0):function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;s>a;a++)t=t>>>8^n[255&(t^e.charCodeAt(a))];return-1^t}(0|e,t,t.length,0):0}},{"./utils":32}],5:[function(t,e,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(t,e,r){"use strict";var i=null;i="undefined"!=typeof Promise?Promise:t("lie"),e.exports={Promise:i}},{lie:37}],7:[function(t,e,r){"use strict";function h(t,e){a.call(this,"FlateWorker/"+t),this._pako=null,this._pakoAction=t,this._pakoOptions=e,this.meta={}}var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,n=t("pako"),s=t("./utils"),a=t("./stream/GenericWorker"),o=i?"uint8array":"array";r.magic="\b\x00",s.inherits(h,a),h.prototype.processChunk=function(t){this.meta=t.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,t.data),!1)},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},h.prototype._createPako=function(){this._pako=new n[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var e=this;this._pako.onData=function(t){e.push({data:t,meta:e.meta})}},r.compressWorker=function(t){return new h("Deflate",t)},r.uncompressWorker=function(){return new h("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(t,e,r){"use strict";function A(t,e){var r,i="";for(r=0;e>r;r++)i+=String.fromCharCode(255&t),t>>>=8;return i}function i(t,e,r,i,n,s){var a,o,h=t.file,u=t.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),d=I.transformTo("string",O.utf8encode(h.name)),c=h.comment,p=I.transformTo("string",s(c)),m=I.transformTo("string",O.utf8encode(c)),_=d.length!==h.name.length,g=m.length!==c.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};e&&!r||(x.crc32=t.crc32,x.compressedSize=t.compressedSize,x.uncompressedSize=t.uncompressedSize);var S=0;e&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===n?(C=798,z|=function(t,e){var r=t;return t||(r=e?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(t){return 63&(t||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+d,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\x00",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\x00\x00\x00\x00"+A(z,4)+A(i,4)+f+b+p}}function s(t,e,r,i){n.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=e,this.zipPlatform=r,this.encodeFileName=i,this.streamFiles=t,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}var I=t("../utils"),n=t("../stream/GenericWorker"),O=t("../utf8"),B=t("../crc32"),R=t("../signature");I.inherits(s,n),s.prototype.push=function(t){var e=t.meta.percent||0,r=this.entriesCount,i=this._sources.length;this.accumulate?this.contentBuffer.push(t):(this.bytesWritten+=t.data.length,n.prototype.push.call(this,{data:t.data,meta:{currentFile:this.currentFile,percent:r?(e+100*(r-i-1))/r:100}}))},s.prototype.openedSource=function(t){this.currentSourceOffset=this.bytesWritten,this.currentFile=t.file.name;var e=this.streamFiles&&!t.file.dir;if(e){var r=i(t,e,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},s.prototype.closedSource=function(t){this.accumulate=!1;var e=this.streamFiles&&!t.file.dir,r=i(t,e,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),e)this.push({data:function(t){return R.DATA_DESCRIPTOR+A(t.crc32,4)+A(t.compressedSize,4)+A(t.uncompressedSize,4)}(t),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},s.prototype.flush=function(){for(var t=this.bytesWritten,e=0;e<this.dirRecords.length;e++)this.push({data:this.dirRecords[e],meta:{percent:100}});var r=this.bytesWritten-t,i=function(t,e,r,i,n){var s=I.transformTo("string",n(i));return R.CENTRAL_DIRECTORY_END+"\x00\x00\x00\x00"+A(t,2)+A(t,2)+A(e,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,t,this.zipComment,this.encodeFileName);this.push({data:i,meta:{percent:100}})},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},s.prototype.registerPrevious=function(t){this._sources.push(t);var e=this;return t.on("data",function(t){e.processChunk(t)}),t.on("end",function(){e.closedSource(e.previous.streamInfo),e._sources.length?e.prepareNextSource():e.end()}),t.on("error",function(t){e.error(t)}),this},s.prototype.resume=function(){return!!n.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(t){var e=this._sources;if(!n.prototype.error.call(this,t))return!1;for(var r=0;r<e.length;r++)try{e[r].error(t)}catch(t){}return!0},s.prototype.lock=function(){n.prototype.lock.call(this);for(var t=this._sources,e=0;e<t.length;e++)t[e].lock()},e.exports=s},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(t,e,r){"use strict";var u=t("../compressions"),i=t("./ZipFileWorker");r.generateWorker=function(t,a,e){var o=new i(a.streamFiles,e,a.platform,a.encodeFileName),h=0;try{t.forEach(function(t,e){h++;var r=function(t,e){var r=t||e,i=u[r];if(!i)throw new Error(r+" is not a valid compression method !");return i}(e.options.compression,a.compression),i=e.options.compressionOptions||a.compressionOptions||{},n=e.dir,s=e.date;e._compressWorker(r,i).withStreamInfo("file",{name:t,dir:n,date:s,comment:e.comment||"",unixPermissions:e.unixPermissions,dosPermissions:e.dosPermissions}).pipe(o)}),o.entriesCount=h}catch(t){o.error(t)}return o}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(t,e,r){"use strict";function i(){if(!(this instanceof i))return new i;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var t=new i;for(var e in this)"function"!=typeof this[e]&&(t[e]=this[e]);return t}}(i.prototype=t("./object")).loadAsync=t("./load"),i.support=t("./support"),i.defaults=t("./defaults"),i.version="3.7.1",i.loadAsync=function(t,e){return(new i).loadAsync(t,e)},i.external=t("./external"),e.exports=i},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(t,e,r){"use strict";function l(i){return new n.Promise(function(t,e){var r=i.decompressed.getContentWorker().pipe(new s);r.on("error",function(t){e(t)}).on("end",function(){r.streamInfo.crc32!==i.decompressed.crc32?e(new Error("Corrupted zip : CRC32 mismatch")):t()}).resume()})}var i=t("./utils"),n=t("./external"),o=t("./utf8"),h=t("./zipEntries"),s=t("./stream/Crc32Probe"),u=t("./nodejsUtils");e.exports=function(t,s){var a=this;return s=i.extend(s||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:o.utf8decode}),u.isNode&&u.isStream(t)?n.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):i.prepareContent("the loaded zip file",t,!0,s.optimizedBinaryString,s.base64).then(function(t){var e=new h(s);return e.load(t),e}).then(function(t){var e=[n.Promise.resolve(t)],r=t.files;if(s.checkCRC32)for(var i=0;i<r.length;i++)e.push(l(r[i]));return n.Promise.all(e)}).then(function(t){for(var e=t.shift(),r=e.files,i=0;i<r.length;i++){var n=r[i];a.file(n.fileNameStr,n.decompressed,{binary:!0,optimizedBinaryString:!0,date:n.date,dir:n.dir,comment:n.fileCommentStr.length?n.fileCommentStr:null,unixPermissions:n.unixPermissions,dosPermissions:n.dosPermissions,createFolders:s.createFolders})}return e.zipComment.length&&(a.comment=e.zipComment),a})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(t,e,r){"use strict";function s(t,e){n.call(this,"Nodejs stream input adapter for "+t),this._upstreamEnded=!1,this._bindStream(e)}var i=t("../utils"),n=t("../stream/GenericWorker");i.inherits(s,n),s.prototype._bindStream=function(t){var e=this;(this._stream=t).pause(),t.on("data",function(t){e.push({data:t,meta:{percent:0}})}).on("error",function(t){e.isPaused?this.generatedError=t:e.error(t)}).on("end",function(){e.isPaused?e._upstreamEnded=!0:e.end()})},s.prototype.pause=function(){return!!n.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!n.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},e.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(t,e,r){"use strict";function i(t,e,r){n.call(this,e),this._helper=t;var i=this;t.on("data",function(t,e){i.push(t)||i._helper.pause(),r&&r(e)}).on("error",function(t){i.emit("error",t)}).on("end",function(){i.push(null)})}var n=t("readable-stream").Readable;t("../utils").inherits(i,n),i.prototype._read=function(){this._helper.resume()},e.exports=i},{"../utils":32,"readable-stream":16}],14:[function(t,e,r){"use strict";e.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(t,e){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(t,e);if("number"==typeof t)throw new Error('The "data" argument must not be a number');return new Buffer(t,e)},allocBuffer:function(t){if(Buffer.alloc)return Buffer.alloc(t);var e=new Buffer(t);return e.fill(0),e},isBuffer:function(t){return Buffer.isBuffer(t)},isStream:function(t){return t&&"function"==typeof t.on&&"function"==typeof t.pause&&"function"==typeof t.resume}}},{}],15:[function(t,e,r){"use strict";function s(t,e,r){var i,n=u.getTypeOf(e),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(t=g(t)),s.createFolders&&(i=_(t))&&b.call(this,i,!0);var a="string"===n&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(e instanceof d&&0===e.uncompressedSize||s.dir||!e||0===e.length)&&(s.base64=!1,s.binary=!0,e="",s.compression="STORE",n="string");var o=null;o=e instanceof d||e instanceof l?e:p.isNode&&p.isStream(e)?new m(t,e):u.prepareContent(t,e,s.binary,s.optimizedBinaryString,s.base64);var h=new c(t,o,s);this.files[t]=h}function h(t){return"[object RegExp]"===Object.prototype.toString.call(t)}var n=t("./utf8"),u=t("./utils"),l=t("./stream/GenericWorker"),a=t("./stream/StreamHelper"),f=t("./defaults"),d=t("./compressedObject"),c=t("./zipObject"),o=t("./generate"),p=t("./nodejsUtils"),m=t("./nodejs/NodejsStreamInputAdapter"),_=function(t){"/"===t.slice(-1)&&(t=t.substring(0,t.length-1));var e=t.lastIndexOf("/");return e>0?t.substring(0,e):""},g=function(t){return"/"!==t.slice(-1)&&(t+="/"),t},b=function(t,e){return e=void 0!==e?e:f.createFolders,t=g(t),this.files[t]||s.call(this,t,null,{dir:!0,createFolders:e}),this.files[t]},i={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(t){var e,r,i;for(e in this.files)i=this.files[e],(r=e.slice(this.root.length,e.length))&&e.slice(0,this.root.length)===this.root&&t(r,i)},filter:function(r){var i=[];return this.forEach(function(t,e){r(t,e)&&i.push(e)}),i},file:function(t,e,r){if(1!==arguments.length)return t=this.root+t,s.call(this,t,e,r),this;if(h(t)){var i=t;return this.filter(function(t,e){return!e.dir&&i.test(t)})}var n=this.files[this.root+t];return n&&!n.dir?n:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(t,e){return e.dir&&r.test(t)});var t=this.root+r,e=b.call(this,t),i=this.clone();return i.root=e.name,i},remove:function(r){r=this.root+r;var t=this.files[r];if(t||("/"!==r.slice(-1)&&(r+="/"),t=this.files[r]),t&&!t.dir)delete this.files[r];else for(var e=this.filter(function(t,e){return e.name.slice(0,r.length)===r}),i=0;i<e.length;i++)delete this.files[e[i].name];return this},generate:function(t){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(t){var e,r={};try{if((r=u.extend(t||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:n.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var i=r.comment||this.comment||"";e=o.generateWorker(this,r,i)}catch(t){(e=new l("error")).error(t)}return new a(e,r.type||"string",r.mimeType)},generateAsync:function(t,e){return this.generateInternalStream(t).accumulate(e)},generateNodeStream:function(t,e){return(t=t||{}).type||(t.type="nodebuffer"),this.generateInternalStream(t).toNodejsStream(e)}};e.exports=i},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(t,e,r){e.exports=t("stream")},{stream:void 0}],17:[function(t,e,r){"use strict";function n(t){i.call(this,t);for(var e=0;e<this.data.length;e++)t[e]=255&t[e]}var i=t("./DataReader");t("../utils").inherits(n,i),n.prototype.byteAt=function(t){return this.data[this.zero+t]},n.prototype.lastIndexOfSignature=function(t){for(var e=t.charCodeAt(0),r=t.charCodeAt(1),i=t.charCodeAt(2),n=t.charCodeAt(3),s=this.length-4;s>=0;--s)if(this.data[s]===e&&this.data[s+1]===r&&this.data[s+2]===i&&this.data[s+3]===n)return s-this.zero;return-1},n.prototype.readAndCheckSignature=function(t){var e=t.charCodeAt(0),r=t.charCodeAt(1),i=t.charCodeAt(2),n=t.charCodeAt(3),s=this.readData(4);return e===s[0]&&r===s[1]&&i===s[2]&&n===s[3]},n.prototype.readData=function(t){if(this.checkOffset(t),0===t)return[];var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n},{"../utils":32,"./DataReader":18}],18:[function(t,e,r){"use strict";function n(t){this.data=t,this.length=t.length,this.index=0,this.zero=0}var i=t("../utils");n.prototype={checkOffset:function(t){this.checkIndex(this.index+t)},checkIndex:function(t){if(this.length<this.zero+t||0>t)throw new Error("End of data reached (data length = "+this.length+", asked index = "+t+"). Corrupted zip ?")},setIndex:function(t){this.checkIndex(t),this.index=t},skip:function(t){this.setIndex(this.index+t)},byteAt:function(t){},readInt:function(t){var e,r=0;for(this.checkOffset(t),e=this.index+t-1;e>=this.index;e--)r=(r<<8)+this.byteAt(e);return this.index+=t,r},readString:function(t){return i.transformTo("string",this.readData(t))},readData:function(t){},lastIndexOfSignature:function(t){},readAndCheckSignature:function(t){},readDate:function(){var t=this.readInt(4);return new Date(Date.UTC(1980+(t>>25&127),(t>>21&15)-1,t>>16&31,t>>11&31,t>>5&63,(31&t)<<1))}},e.exports=n},{"../utils":32}],19:[function(t,e,r){"use strict";function n(t){i.call(this,t)}var i=t("./Uint8ArrayReader");t("../utils").inherits(n,i),n.prototype.readData=function(t){this.checkOffset(t);var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(t,e,r){"use strict";function n(t){i.call(this,t)}var i=t("./DataReader");t("../utils").inherits(n,i),n.prototype.byteAt=function(t){return this.data.charCodeAt(this.zero+t)},n.prototype.lastIndexOfSignature=function(t){return this.data.lastIndexOf(t)-this.zero},n.prototype.readAndCheckSignature=function(t){return t===this.readData(4)},n.prototype.readData=function(t){this.checkOffset(t);var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n},{"../utils":32,"./DataReader":18}],21:[function(t,e,r){"use strict";function n(t){i.call(this,t)}var i=t("./ArrayReader");t("../utils").inherits(n,i),n.prototype.readData=function(t){if(this.checkOffset(t),0===t)return new Uint8Array(0);var e=this.data.subarray(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n},{"../utils":32,"./ArrayReader":17}],22:[function(t,e,r){"use strict";var i=t("../utils"),n=t("../support"),s=t("./ArrayReader"),a=t("./StringReader"),o=t("./NodeBufferReader"),h=t("./Uint8ArrayReader");e.exports=function(t){var e=i.getTypeOf(t);return i.checkSupport(e),"string"!==e||n.uint8array?"nodebuffer"===e?new o(t):n.uint8array?new h(i.transformTo("uint8array",t)):new s(i.transformTo("array",t)):new a(t)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(t,e,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(t,e,r){"use strict";function s(t){i.call(this,"ConvertWorker to "+t),this.destType=t}var i=t("./GenericWorker"),n=t("../utils");n.inherits(s,i),s.prototype.processChunk=function(t){this.push({data:n.transformTo(this.destType,t.data),meta:t.meta})},e.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(t,e,r){"use strict";function s(){i.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}var i=t("./GenericWorker"),n=t("../crc32");t("../utils").inherits(s,i),s.prototype.processChunk=function(t){this.streamInfo.crc32=n(t.data,this.streamInfo.crc32||0),this.push(t)},e.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(t,e,r){"use strict";function s(t){n.call(this,"DataLengthProbe for "+t),this.propName=t,this.withStreamInfo(t,0)}var i=t("../utils"),n=t("./GenericWorker");i.inherits(s,n),s.prototype.processChunk=function(t){if(t){var e=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=e+t.data.length}n.prototype.processChunk.call(this,t)},e.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(t,e,r){"use strict";function s(t){n.call(this,"DataWorker");var e=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,t.then(function(t){e.dataIsReady=!0,e.data=t,e.max=t&&t.length||0,e.type=i.getTypeOf(t),e.isPaused||e._tickAndRepeat()},function(t){e.error(t)})}var i=t("../utils"),n=t("./GenericWorker");i.inherits(s,n),s.prototype.cleanUp=function(){n.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!n.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,i.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(i.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var t=null,e=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":t=this.data.substring(this.index,e);break;case"uint8array":t=this.data.subarray(this.index,e);break;case"array":case"nodebuffer":t=this.data.slice(this.index,e)}return this.index=e,this.push({data:t,meta:{percent:this.max?this.index/this.max*100:0}})},e.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(t,e,r){"use strict";function i(t){this.name=t||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}i.prototype={push:function(t){this.emit("data",t)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(t){this.emit("error",t)}return!0},error:function(t){return!this.isFinished&&(this.isPaused?this.generatedError=t:(this.isFinished=!0,this.emit("error",t),this.previous&&this.previous.error(t),this.cleanUp()),!0)},on:function(t,e){return this._listeners[t].push(e),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(t,e){if(this._listeners[t])for(var r=0;r<this._listeners[t].length;r++)this._listeners[t][r].call(this,e)},pipe:function(t){return t.registerPrevious(this)},registerPrevious:function(t){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=t.streamInfo,this.mergeStreamInfo(),this.previous=t;var e=this;return t.on("data",function(t){e.processChunk(t)}),t.on("end",function(){e.end()}),t.on("error",function(t){e.error(t)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var t=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),t=!0),this.previous&&this.previous.resume(),!t},flush:function(){},processChunk:function(t){this.push(t)},withStreamInfo:function(t,e){return this.extraStreamInfo[t]=e,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var t in this.extraStreamInfo)this.extraStreamInfo.hasOwnProperty(t)&&(this.streamInfo[t]=this.extraStreamInfo[t])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var t="Worker "+this.name;return this.previous?this.previous+" -> "+t:t}},e.exports=i},{}],29:[function(t,e,r){"use strict";function l(t,o){return new a.Promise(function(e,r){var i=[],n=t._internalType,s=t._outputType,a=t._mimeType;t.on("data",function(t,e){i.push(t),o&&o(e)}).on("error",function(t){i=[],r(t)}).on("end",function(){try{var t=function(t,e,r){switch(t){case"blob":return h.newBlob(h.transformTo("arraybuffer",e),r);case"base64":return u.encode(e);default:return h.transformTo(t,e)}}(s,function(t,e){var r,i=0,n=null,s=0;for(r=0;r<e.length;r++)s+=e[r].length;switch(t){case"string":return e.join("");case"array":return Array.prototype.concat.apply([],e);case"uint8array":for(n=new Uint8Array(s),r=0;r<e.length;r++)n.set(e[r],i),i+=e[r].length;return n;case"nodebuffer":return Buffer.concat(e);default:throw new Error("concat : unsupported type '"+t+"'")}}(n,i),a);e(t)}catch(t){r(t)}i=[]}).resume()})}function f(t,e,r){var i=e;switch(e){case"blob":case"arraybuffer":i="uint8array";break;case"base64":i="string"}try{this._internalType=i,this._outputType=e,this._mimeType=r,h.checkSupport(i),this._worker=t.pipe(new n(i)),t.lock()}catch(t){this._worker=new s("error"),this._worker.error(t)}}var h=t("../utils"),n=t("./ConvertWorker"),s=t("./GenericWorker"),u=t("../base64"),i=t("../support"),a=t("../external"),o=null;if(i.nodestream)try{o=t("../nodejs/NodejsStreamOutputAdapter")}catch(t){}f.prototype={accumulate:function(t){return l(this,t)},on:function(t,e){var r=this;return"data"===t?this._worker.on(t,function(t){e.call(r,t.data,t.meta)}):this._worker.on(t,function(){h.delay(e,arguments,r)}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(t){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},t)}},e.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(t,e,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var i=new ArrayBuffer(0);try{r.blob=0===new Blob([i],{type:"application/zip"}).size}catch(t){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);n.append(i),r.blob=0===n.getBlob("application/zip").size}catch(t){r.blob=!1}}}try{r.nodestream=!!t("readable-stream").Readable}catch(t){r.nodestream=!1}},{"readable-stream":16}],31:[function(t,e,s){"use strict";function a(){i.call(this,"utf-8 decode"),this.leftOver=null}function l(){i.call(this,"utf-8 encode")}for(var o=t("./utils"),h=t("./support"),r=t("./nodejsUtils"),i=t("./stream/GenericWorker"),u=new Array(256),n=0;256>n;n++)u[n]=n>=252?6:n>=248?5:n>=240?4:n>=224?3:n>=192?2:1;u[254]=u[254]=1,s.utf8encode=function(t){return h.nodebuffer?r.newBufferFrom(t,"utf-8"):function(t){var e,r,i,n,s,a=t.length,o=0;for(n=0;a>n;n++)55296==(64512&(r=t.charCodeAt(n)))&&a>n+1&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),o+=128>r?1:2048>r?2:65536>r?3:4;for(e=h.uint8array?new Uint8Array(o):new Array(o),n=s=0;o>s;n++)55296==(64512&(r=t.charCodeAt(n)))&&a>n+1&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),128>r?e[s++]=r:(2048>r?e[s++]=192|r>>>6:(65536>r?e[s++]=224|r>>>12:(e[s++]=240|r>>>18,e[s++]=128|r>>>12&63),e[s++]=128|r>>>6&63),e[s++]=128|63&r);return e}(t)},s.utf8decode=function(t){return h.nodebuffer?o.transformTo("nodebuffer",t).toString("utf-8"):function(t){var e,r,i,n,s=t.length,a=new Array(2*s);for(e=r=0;s>e;)if((i=t[e++])<128)a[r++]=i;else if(4<(n=u[i]))a[r++]=65533,e+=n-1;else{for(i&=2===n?31:3===n?15:7;n>1&&s>e;)i=i<<6|63&t[e++],n--;n>1?a[r++]=65533:65536>i?a[r++]=i:(i-=65536,a[r++]=55296|i>>10&1023,a[r++]=56320|1023&i)}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(t=o.transformTo(h.uint8array?"uint8array":"array",t))},o.inherits(a,i),a.prototype.processChunk=function(t){var e=o.transformTo(h.uint8array?"uint8array":"array",t.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=e;(e=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),e.set(r,this.leftOver.length)}else e=this.leftOver.concat(e);this.leftOver=null}var i=function(t,e){var r;for((e=e||t.length)>t.length&&(e=t.length),r=e-1;r>=0&&128==(192&t[r]);)r--;return 0>r?e:0===r?e:r+u[t[r]]>e?r:e}(e),n=e;i!==e.length&&(h.uint8array?(n=e.subarray(0,i),this.leftOver=e.subarray(i,e.length)):(n=e.slice(0,i),this.leftOver=e.slice(i,e.length))),this.push({data:s.utf8decode(n),meta:t.meta})},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=a,o.inherits(l,i),l.prototype.processChunk=function(t){this.push({data:s.utf8encode(t.data),meta:t.meta})},s.Utf8EncodeWorker=l},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(t,e,a){"use strict";function n(t){return t}function l(t,e){for(var r=0;r<t.length;++r)e[r]=255&t.charCodeAt(r);return e}function f(t){var e=65536,r=a.getTypeOf(t),i=!0;if("uint8array"===r?i=s.applyCanBeUsed.uint8array:"nodebuffer"===r&&(i=s.applyCanBeUsed.nodebuffer),i)for(;e>1;)try{return s.stringifyByChunk(t,r,e)}catch(t){e=Math.floor(e/2)}return s.stringifyByChar(t)}function d(t,e){for(var r=0;r<t.length;r++)e[r]=t[r];return e}var o=t("./support"),h=t("./base64"),r=t("./nodejsUtils"),i=t("set-immediate-shim"),u=t("./external");a.newBlob=function(e,r){a.checkSupport("blob");try{return new Blob([e],{type:r})}catch(t){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return i.append(e),i.getBlob(r)}catch(t){throw new Error("Bug : can't construct the Blob.")}}};var s={stringifyByChunk:function(t,e,r){var i=[],n=0,s=t.length;if(r>=s)return String.fromCharCode.apply(null,t);
for(;s>n;)"array"===e||"nodebuffer"===e?i.push(String.fromCharCode.apply(null,t.slice(n,Math.min(n+r,s)))):i.push(String.fromCharCode.apply(null,t.subarray(n,Math.min(n+r,s)))),n+=r;return i.join("")},stringifyByChar:function(t){for(var e="",r=0;r<t.length;r++)e+=String.fromCharCode(t[r]);return e},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(t){return!1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(t){return!1}}()}};a.applyFromCharCode=f;var c={};c.string={string:n,array:function(t){return l(t,new Array(t.length))},arraybuffer:function(t){return c.string.uint8array(t).buffer},uint8array:function(t){return l(t,new Uint8Array(t.length))},nodebuffer:function(t){return l(t,r.allocBuffer(t.length))}},c.array={string:f,array:n,arraybuffer:function(t){return new Uint8Array(t).buffer},uint8array:function(t){return new Uint8Array(t)},nodebuffer:function(t){return r.newBufferFrom(t)}},c.arraybuffer={string:function(t){return f(new Uint8Array(t))},array:function(t){return d(new Uint8Array(t),new Array(t.byteLength))},arraybuffer:n,uint8array:function(t){return new Uint8Array(t)},nodebuffer:function(t){return r.newBufferFrom(new Uint8Array(t))}},c.uint8array={string:f,array:function(t){return d(t,new Array(t.length))},arraybuffer:function(t){return t.buffer},uint8array:n,nodebuffer:function(t){return r.newBufferFrom(t)}},c.nodebuffer={string:f,array:function(t){return d(t,new Array(t.length))},arraybuffer:function(t){return c.nodebuffer.uint8array(t).buffer},uint8array:function(t){return d(t,new Uint8Array(t.length))},nodebuffer:n},a.transformTo=function(t,e){if(e=e||"",!t)return e;a.checkSupport(t);var r=a.getTypeOf(e);return c[r][t](e)},a.getTypeOf=function(t){return"string"==typeof t?"string":"[object Array]"===Object.prototype.toString.call(t)?"array":o.nodebuffer&&r.isBuffer(t)?"nodebuffer":o.uint8array&&t instanceof Uint8Array?"uint8array":o.arraybuffer&&t instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(t){if(!o[t.toLowerCase()])throw new Error(t+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(t){var e,r,i="";for(r=0;r<(t||"").length;r++)i+="\\x"+((e=t.charCodeAt(r))<16?"0":"")+e.toString(16).toUpperCase();return i},a.delay=function(t,e,r){i(function(){t.apply(r||null,e||[])})},a.inherits=function(t,e){function r(){}r.prototype=e.prototype,t.prototype=new r},a.extend=function(){var t,e,r={};for(t=0;t<arguments.length;t++)for(e in arguments[t])arguments[t].hasOwnProperty(e)&&void 0===r[e]&&(r[e]=arguments[t][e]);return r},a.prepareContent=function(r,t,i,n,s){return u.Promise.resolve(t).then(function(i){return o.blob&&(i instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(i)))&&"undefined"!=typeof FileReader?new u.Promise(function(e,r){var t=new FileReader;t.onload=function(t){e(t.target.result)},t.onerror=function(t){r(t.target.error)},t.readAsArrayBuffer(i)}):i}).then(function(t){var e=a.getTypeOf(t);return e?("arraybuffer"===e?t=a.transformTo("uint8array",t):"string"===e&&(s?t=h.decode(t):i&&!0!==n&&(t=function(t){return l(t,o.uint8array?new Uint8Array(t.length):new Array(t.length))}(t))),t):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,"set-immediate-shim":54}],33:[function(t,e,r){"use strict";function h(t){this.files=[],this.loadOptions=t}var i=t("./reader/readerFor"),n=t("./utils"),s=t("./signature"),a=t("./zipEntry"),o=(t("./utf8"),t("./support"));h.prototype={checkSignature:function(t){if(!this.reader.readAndCheckSignature(t)){this.reader.index-=4;var e=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+n.pretty(e)+", expected "+n.pretty(t)+")")}},isSignature:function(t,e){var r=this.reader.index;this.reader.setIndex(t);var i=this.reader.readString(4)===e;return this.reader.setIndex(r),i},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var t=this.reader.readData(this.zipCommentLength),e=o.uint8array?"uint8array":"array",r=n.transformTo(e,t);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var t,e,r,i=this.zip64EndOfCentralSize-44;i>0;)t=this.reader.readInt(2),e=this.reader.readInt(4),r=this.reader.readData(e),this.zip64ExtensibleData[t]={id:t,length:e,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var t,e;for(t=0;t<this.files.length;t++)e=this.files[t],this.reader.setIndex(e.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),e.readLocalPart(this.reader),e.handleUTF8(),e.processAttributes()},readCentralDir:function(){var t;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(t=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(t);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var t=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(0>t)throw this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(t);var e=t;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===n.MAX_VALUE_16BITS||this.diskWithCentralDirStart===n.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===n.MAX_VALUE_16BITS||this.centralDirRecords===n.MAX_VALUE_16BITS||this.centralDirSize===n.MAX_VALUE_32BITS||this.centralDirOffset===n.MAX_VALUE_32BITS){if(this.zip64=!0,(t=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(t),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var i=e-r;if(i>0)this.isSignature(e,s.CENTRAL_FILE_HEADER)||(this.reader.zero=i);else if(0>i)throw new Error("Corrupted zip: missing "+Math.abs(i)+" bytes.")},prepareReader:function(t){this.reader=i(t)},load:function(t){this.prepareReader(t),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},e.exports=h},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utf8":31,"./utils":32,"./zipEntry":34}],34:[function(t,e,r){"use strict";function l(t,e){this.options=t,this.loadOptions=e}var i=t("./reader/readerFor"),s=t("./utils"),n=t("./compressedObject"),a=t("./crc32"),o=t("./utf8"),h=t("./compressions"),u=t("./support");l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(t){var e,r;if(t.skip(22),this.fileNameLength=t.readInt(2),r=t.readInt(2),this.fileName=t.readData(this.fileNameLength),t.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(e=function(t){for(var e in h)if(h.hasOwnProperty(e)&&h[e].magic===t)return h[e];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new n(this.compressedSize,this.uncompressedSize,this.crc32,e,t.readData(this.compressedSize))},readCentralPart:function(t){this.versionMadeBy=t.readInt(2),t.skip(2),this.bitFlag=t.readInt(2),this.compressionMethod=t.readString(2),this.date=t.readDate(),this.crc32=t.readInt(4),this.compressedSize=t.readInt(4),this.uncompressedSize=t.readInt(4);var e=t.readInt(2);if(this.extraFieldsLength=t.readInt(2),this.fileCommentLength=t.readInt(2),this.diskNumberStart=t.readInt(2),this.internalFileAttributes=t.readInt(2),this.externalFileAttributes=t.readInt(4),this.localHeaderOffset=t.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");t.skip(e),this.readExtraFields(t),this.parseZIP64ExtraField(t),this.fileComment=t.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var t=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==t&&(this.dosPermissions=63&this.externalFileAttributes),3==t&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(t){if(this.extraFields[1]){var e=i(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(t){var e,r,i,n=t.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});t.index+4<n;)e=t.readInt(2),r=t.readInt(2),i=t.readData(r),this.extraFields[e]={id:e,length:r,value:i};t.setIndex(n)},handleUTF8:function(){var t=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else{var e=this.findExtraFieldUnicodePath();if(null!==e)this.fileNameStr=e;else{var r=s.transformTo(t,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var i=this.findExtraFieldUnicodeComment();if(null!==i)this.fileCommentStr=i;else{var n=s.transformTo(t,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(n)}}},findExtraFieldUnicodePath:function(){var t=this.extraFields[28789];if(t){var e=i(t.value);return 1!==e.readInt(1)?null:a(this.fileName)!==e.readInt(4)?null:o.utf8decode(e.readData(t.length-5))}return null},findExtraFieldUnicodeComment:function(){var t=this.extraFields[25461];if(t){var e=i(t.value);return 1!==e.readInt(1)?null:a(this.fileComment)!==e.readInt(4)?null:o.utf8decode(e.readData(t.length-5))}return null}},e.exports=l},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(t,e,r){"use strict";function i(t,e,r){this.name=t,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=e,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=t("./stream/StreamHelper"),n=t("./stream/DataWorker"),a=t("./utf8"),o=t("./compressedObject"),h=t("./stream/GenericWorker");i.prototype={internalStream:function(t){var e=null,r="string";try{if(!t)throw new Error("No output type specified.");var i="string"===(r=t.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),e=this._decompressWorker();var n=!this._dataBinary;n&&!i&&(e=e.pipe(new a.Utf8EncodeWorker)),!n&&i&&(e=e.pipe(new a.Utf8DecodeWorker))}catch(t){(e=new h("error")).error(t)}return new s(e,r,"")},async:function(t,e){return this.internalStream(t).accumulate(e)},nodeStream:function(t,e){return this.internalStream(t||"nodebuffer").toNodejsStream(e)},_compressWorker:function(t,e){if(this._data instanceof o&&this._data.compression.magic===t.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,t,e)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new n(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)i.prototype[u[f]]=l;e.exports=i},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(t,l,e){(function(e){"use strict";function u(){var t,e;i=!0;for(var r=h.length;r;){for(e=h,h=[],t=-1;++t<r;)e[t]();r=h.length}i=!1}var r,i,t=e.MutationObserver||e.WebKitMutationObserver;if(t){var n=0,s=new t(u),a=e.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=n=++n%2}}else if(e.setImmediate||void 0===e.MessageChannel)r="document"in e&&"onreadystatechange"in e.document.createElement("script")?function(){var t=e.document.createElement("script");t.onreadystatechange=function(){u(),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null},e.document.documentElement.appendChild(t)}:function(){setTimeout(u,0)};else{var o=new e.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0)}}var h=[];l.exports=function(t){1!==h.push(t)||i||r()}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(t,e,r){"use strict";function u(){}function o(t){if("function"!=typeof t)throw new TypeError("resolver must be a function");this.state=i,this.queue=[],this.outcome=void 0,t!==u&&c(this,t)}function h(t,e,r){this.promise=t,"function"==typeof e&&(this.onFulfilled=e,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function f(e,r,i){n(function(){var t;try{t=r(i)}catch(t){return l.reject(e,t)}t===e?l.reject(e,new TypeError("Cannot resolve promise with itself")):l.resolve(e,t)})}function d(t){var e=t&&t.then;return!t||"object"!=typeof t&&"function"!=typeof t||"function"!=typeof e?void 0:function(){e.apply(t,arguments)}}function c(e,t){function i(t){r||(r=!0,l.reject(e,t))}function n(t){r||(r=!0,l.resolve(e,t))}var r=!1,s=p(function(){t(n,i)});"error"===s.status&&i(s.value)}function p(t,e){var r={};try{r.value=t(e),r.status="success"}catch(t){r.status="error",r.value=t}return r}var n=t("immediate"),l={},s=["REJECTED"],a=["FULFILLED"],i=["PENDING"];(e.exports=o).prototype["finally"]=function(e){if("function"!=typeof e)return this;var r=this.constructor;return this.then(function(t){return r.resolve(e()).then(function(){return t})},function(t){return r.resolve(e()).then(function(){throw t})})},o.prototype["catch"]=function(t){return this.then(null,t)},o.prototype.then=function(t,e){if("function"!=typeof t&&this.state===a||"function"!=typeof e&&this.state===s)return this;var r=new this.constructor(u);return this.state!==i?f(r,this.state===a?t:e,this.outcome):this.queue.push(new h(r,t,e)),r},h.prototype.callFulfilled=function(t){l.resolve(this.promise,t)},h.prototype.otherCallFulfilled=function(t){f(this.promise,this.onFulfilled,t)},h.prototype.callRejected=function(t){l.reject(this.promise,t)},h.prototype.otherCallRejected=function(t){f(this.promise,this.onRejected,t)},l.resolve=function(t,e){var r=p(d,e);if("error"===r.status)return l.reject(t,r.value);var i=r.value;if(i)c(t,i);else{t.state=a,t.outcome=e;for(var n=-1,s=t.queue.length;++n<s;)t.queue[n].callFulfilled(e)}return t},l.reject=function(t,e){t.state=s,t.outcome=e;for(var r=-1,i=t.queue.length;++r<i;)t.queue[r].callRejected(e);return t},o.resolve=function(t){return t instanceof this?t:l.resolve(new this(u),t)},o.reject=function(t){var e=new this(u);return l.reject(e,t)},o.all=function(t){function h(t,e){r.resolve(t).then(function(t){s[e]=t,++a!==i||n||(n=!0,l.resolve(o,s))},function(t){n||(n=!0,l.reject(o,t))})}var r=this;if("[object Array]"!==Object.prototype.toString.call(t))return this.reject(new TypeError("must be an array"));var i=t.length,n=!1;if(!i)return this.resolve([]);for(var s=new Array(i),a=0,e=-1,o=new this(u);++e<i;)h(t[e],e);return o},o.race=function(t){var e=this;if("[object Array]"!==Object.prototype.toString.call(t))return this.reject(new TypeError("must be an array"));var r=t.length,i=!1;if(!r)return this.resolve([]);for(var n=-1,s=new this(u);++n<r;)a=t[n],e.resolve(a).then(function(t){i||(i=!0,l.resolve(s,t))},function(t){i||(i=!0,l.reject(s,t))});var a;return s}},{immediate:36}],38:[function(t,e,r){"use strict";var i={};t("./lib/utils/common").assign(i,t("./lib/deflate"),t("./lib/inflate"),t("./lib/zlib/constants")),e.exports=i},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(t,e,r){"use strict";function p(t){if(!(this instanceof p))return new p(t);this.options=o.assign({level:f,method:c,chunkSize:16384,windowBits:15,memLevel:8,strategy:d,to:""},t||{});var e=this.options;e.raw&&0<e.windowBits?e.windowBits=-e.windowBits:e.gzip&&0<e.windowBits&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(r!==l)throw new Error(n[r]);if(e.header&&a.deflateSetHeader(this.strm,e.header),e.dictionary){var i;if(i="string"==typeof e.dictionary?h.string2buf(e.dictionary):"[object ArrayBuffer]"===u.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,(r=a.deflateSetDictionary(this.strm,i))!==l)throw new Error(n[r]);this._dict_set=!0}}function i(t,e){var r=new p(e);if(r.push(t,!0),r.err)throw r.msg||n[r.err];return r.result}var a=t("./zlib/deflate"),o=t("./utils/common"),h=t("./utils/strings"),n=t("./zlib/messages"),s=t("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,d=0,c=8;p.prototype.push=function(t,e){var r,i,n=this.strm,s=this.options.chunkSize;if(this.ended)return!1;i=e===~~e?e:!0===e?4:0,"string"==typeof t?n.input=h.string2buf(t):"[object ArrayBuffer]"===u.call(t)?n.input=new Uint8Array(t):n.input=t,n.next_in=0,n.avail_in=n.input.length;do{if(0===n.avail_out&&(n.output=new o.Buf8(s),n.next_out=0,n.avail_out=s),1!==(r=a.deflate(n,i))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==n.avail_out&&(0!==n.avail_in||4!==i&&2!==i)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(n.output,n.next_out))):this.onData(o.shrinkBuf(n.output,n.next_out)))}while((0<n.avail_in||0===n.avail_out)&&1!==r);return 4===i?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==i||(this.onEnd(l),!(n.avail_out=0))},p.prototype.onData=function(t){this.chunks.push(t)},p.prototype.onEnd=function(t){t===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},r.Deflate=p,r.deflate=i,r.deflateRaw=function(t,e){return(e=e||{}).raw=!0,i(t,e)},r.gzip=function(t,e){return(e=e||{}).gzip=!0,i(t,e)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(t,e,r){"use strict";function a(t){if(!(this instanceof a))return new a(t);this.options=c.assign({chunkSize:16384,windowBits:0,to:""},t||{});var e=this.options;e.raw&&0<=e.windowBits&&e.windowBits<16&&(e.windowBits=-e.windowBits,0===e.windowBits&&(e.windowBits=-15)),!(0<=e.windowBits&&e.windowBits<16)||t&&t.windowBits||(e.windowBits+=32),15<e.windowBits&&e.windowBits<48&&0==(15&e.windowBits)&&(e.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new n,this.strm.avail_out=0;var r=d.inflateInit2(this.strm,e.windowBits);if(r!==m.Z_OK)throw new Error(i[r]);this.header=new s,d.inflateGetHeader(this.strm,this.header)}function o(t,e){var r=new a(e);if(r.push(t,!0),r.err)throw r.msg||i[r.err];return r.result}var d=t("./zlib/inflate"),c=t("./utils/common"),p=t("./utils/strings"),m=t("./zlib/constants"),i=t("./zlib/messages"),n=t("./zlib/zstream"),s=t("./zlib/gzheader"),_=Object.prototype.toString;a.prototype.push=function(t,e){var r,i,n,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return!1;i=e===~~e?e:!0===e?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof t?h.input=p.binstring2buf(t):"[object ArrayBuffer]"===_.call(t)?h.input=new Uint8Array(t):h.input=t,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new c.Buf8(u),h.next_out=0,h.avail_out=u),(r=d.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=d.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||i!==m.Z_FINISH&&i!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(n=p.utf8border(h.output,h.next_out),s=h.next_out-n,a=p.buf2string(h.output,n),h.next_out=s,h.avail_out=u-s,s&&c.arraySet(h.output,h.output,n,s,0),this.onData(a)):this.onData(c.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0)}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(i=m.Z_FINISH),i===m.Z_FINISH?(r=d.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):i!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(t){this.chunks.push(t)},a.prototype.onEnd=function(t){t===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=c.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},r.Inflate=a,r.inflate=o,r.inflateRaw=function(t,e){return(e=e||{}).raw=!0,o(t,e)},r.ungzip=o},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(t,e,r){"use strict";var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(t){for(var e=Array.prototype.slice.call(arguments,1);e.length;){var r=e.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var i in r)r.hasOwnProperty(i)&&(t[i]=r[i])}}return t},r.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var n={arraySet:function(t,e,r,i,n){if(e.subarray&&t.subarray)t.set(e.subarray(r,r+i),n);else for(var s=0;i>s;s++)t[n+s]=e[r+s]},flattenChunks:function(t){var e,r,i,n,s,a;for(e=i=0,r=t.length;r>e;e++)i+=t[e].length;for(a=new Uint8Array(i),e=n=0,r=t.length;r>e;e++)s=t[e],a.set(s,n),n+=s.length;return a}},s={arraySet:function(t,e,r,i,n){for(var s=0;i>s;s++)t[n+s]=e[r+s]},flattenChunks:function(t){return[].concat.apply([],t)}};r.setTyped=function(t){t?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,n)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(i)},{}],42:[function(t,e,r){"use strict";function l(t,e){if(65537>e&&(t.subarray&&s||!t.subarray&&n))return String.fromCharCode.apply(null,h.shrinkBuf(t,e));for(var r="",i=0;e>i;i++)r+=String.fromCharCode(t[i]);return r}var h=t("./common"),n=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(t){n=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(t){s=!1}for(var u=new h.Buf8(256),i=0;256>i;i++)u[i]=i>=252?6:i>=248?5:i>=240?4:i>=224?3:i>=192?2:1;u[254]=u[254]=1,r.string2buf=function(t){var e,r,i,n,s,a=t.length,o=0;for(n=0;a>n;n++)55296==(64512&(r=t.charCodeAt(n)))&&a>n+1&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),o+=128>r?1:2048>r?2:65536>r?3:4;for(e=new h.Buf8(o),n=s=0;o>s;n++)55296==(64512&(r=t.charCodeAt(n)))&&a>n+1&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),128>r?e[s++]=r:(2048>r?e[s++]=192|r>>>6:(65536>r?e[s++]=224|r>>>12:(e[s++]=240|r>>>18,e[s++]=128|r>>>12&63),e[s++]=128|r>>>6&63),e[s++]=128|63&r);return e},r.buf2binstring=function(t){return l(t,t.length)},r.binstring2buf=function(t){for(var e=new h.Buf8(t.length),r=0,i=e.length;i>r;r++)e[r]=t.charCodeAt(r);return e},r.buf2string=function(t,e){var r,i,n,s,a=e||t.length,o=new Array(2*a);for(r=i=0;a>r;)if((n=t[r++])<128)o[i++]=n;else if(4<(s=u[n]))o[i++]=65533,r+=s-1;else{for(n&=2===s?31:3===s?15:7;s>1&&a>r;)n=n<<6|63&t[r++],s--;s>1?o[i++]=65533:65536>n?o[i++]=n:(n-=65536,o[i++]=55296|n>>10&1023,o[i++]=56320|1023&n)}return l(o,i)},r.utf8border=function(t,e){var r;for((e=e||t.length)>t.length&&(e=t.length),r=e-1;r>=0&&128==(192&t[r]);)r--;return 0>r?e:0===r?e:r+u[t[r]]>e?r:e}},{"./common":41}],43:[function(t,e,r){"use strict";e.exports=function(t,e,r,i){for(var n=65535&t|0,s=t>>>16&65535|0,a=0;0!==r;){for(r-=a=r>2e3?2e3:r;s=s+(n=n+e[i++]|0)|0,--a;);n%=65521,s%=65521}return n|s<<16|0}},{}],44:[function(t,e,r){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(t,e,r){"use strict";var o=function(){for(var t,e=[],r=0;256>r;r++){t=r;for(var i=0;8>i;i++)t=1&t?3988292384^t>>>1:t>>>1;e[r]=t}return e}();e.exports=function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;s>a;a++)t=t>>>8^n[255&(t^e[a])];return-1^t}},{}],46:[function(t,e,r){"use strict";function R(t,e){return t.msg=i[e],e}function T(t){return(t<<1)-(t>4?9:0)}function D(t){for(var e=t.length;0<=--e;)t[e]=0}function F(t){var e=t.state,r=e.pending;r>t.avail_out&&(r=t.avail_out),0!==r&&(d.arraySet(t.output,e.pending_buf,e.pending_out,r,t.next_out),t.next_out+=r,e.pending_out+=r,t.total_out+=r,t.avail_out-=r,e.pending-=r,0===e.pending&&(e.pending_out=0))}function N(t,e){u._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,F(t.strm)}function U(t,e){t.pending_buf[t.pending++]=e}function P(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function L(t,e){var r,i,n=t.max_chain_length,s=t.strstart,a=t.prev_length,o=t.nice_match,h=t.strstart>t.w_size-z?t.strstart-(t.w_size-z):0,u=t.window,l=t.w_mask,f=t.prev,d=t.strstart+S,c=u[s+a-1],p=u[s+a];t.prev_length>=t.good_match&&(n>>=2),o>t.lookahead&&(o=t.lookahead);do if(u[(r=e)+a]===p&&u[r+a-1]===c&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do;while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&d>s);if(i=S-(d-s),s=d-S,i>a){if(t.match_start=e,o<=(a=i))break;c=u[s+a-1],p=u[s+a]}}while((e=f[e&l])>h&&0!=--n);return a<=t.lookahead?a:t.lookahead}function j(t){var e,r,i,n,s,a,o,h,u,l,f=t.w_size;do{if(n=t.window_size-t.lookahead-t.strstart,t.strstart>=f+(f-z)){for(d.arraySet(t.window,t.window,f,f,0),t.match_start-=f,t.strstart-=f,t.block_start-=f,e=r=t.hash_size;i=t.head[--e],t.head[e]=i>=f?i-f:0,--r;);for(e=r=f;i=t.prev[--e],t.prev[e]=i>=f?i-f:0,--r;);n+=f}if(0===t.strm.avail_in)break;if(a=t.strm,o=t.window,h=t.strstart+t.lookahead,u=n,l=void 0,l=a.avail_in,l>u&&(l=u),r=0===l?0:(a.avail_in-=l,d.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=c(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),t.lookahead+=r,t.lookahead+t.insert>=x)for(s=t.strstart-t.insert,t.ins_h=t.window[s],t.ins_h=(t.ins_h<<t.hash_shift^t.window[s+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[s+x-1])&t.hash_mask,t.prev[s&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=s,s++,t.insert--,!(t.lookahead+t.insert<x)););}while(t.lookahead<z&&0!==t.strm.avail_in)}function Z(t,e){for(var r,i;;){if(t.lookahead<z){if(j(t),t.lookahead<z&&e===l)return A;if(0===t.lookahead)break}if(r=0,t.lookahead>=x&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==r&&t.strstart-r<=t.w_size-z&&(t.match_length=L(t,r)),t.match_length>=x)if(i=u._tr_tally(t,t.strstart-t.match_start,t.match_length-x),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=x){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,0!=--t.match_length;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else i=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(i&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=t.strstart<x-1?t.strstart:x-1,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}function W(t,e){for(var r,i,n;;){if(t.lookahead<z){if(j(t),t.lookahead<z&&e===l)return A;if(0===t.lookahead)break}if(r=0,t.lookahead>=x&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=x-1,0!==r&&t.prev_length<t.max_lazy_match&&t.strstart-r<=t.w_size-z&&(t.match_length=L(t,r),t.match_length<=5&&(1===t.strategy||t.match_length===x&&4096<t.strstart-t.match_start)&&(t.match_length=x-1)),t.prev_length>=x&&t.match_length<=t.prev_length){for(n=t.strstart+t.lookahead-x,i=u._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-x),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=n&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!=--t.prev_length;);if(t.match_available=0,t.match_length=x-1,t.strstart++,i&&(N(t,!1),0===t.strm.avail_out))return A}else if(t.match_available){if((i=u._tr_tally(t,0,t.window[t.strstart-1]))&&N(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return A}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(i=u._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<x-1?t.strstart:x-1,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}function M(t,e,r,i,n){this.good_length=t,this.max_lazy=e,this.nice_length=r,this.max_chain=i,this.func=n}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,
this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new d.Buf16(2*w),this.dyn_dtree=new d.Buf16(2*(2*a+1)),this.bl_tree=new d.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new d.Buf16(k+1),this.heap=new d.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new d.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=n,(e=t.state).pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?C:E,t.adler=2===e.wrap?0:1,e.last_flush=l,u._tr_init(e),m):R(t,_)}function K(t){var e=G(t);return e===m&&function(t){t.window_size=2*t.w_size,D(t.head),t.max_lazy_match=h[t.level].max_lazy,t.good_match=h[t.level].good_length,t.nice_match=h[t.level].nice_length,t.max_chain_length=h[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=x-1,t.match_available=0,t.ins_h=0}(t.state),e}function Y(t,e,r,i,n,s){if(!t)return _;var a=1;if(e===g&&(e=6),0>i?(a=0,i=-i):i>15&&(a=2,i-=16),1>n||n>y||r!==v||8>i||i>15||0>e||e>9||0>s||s>b)return R(t,_);8===i&&(i=9);var o=new H;return(t.state=o).strm=t,o.wrap=a,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=n+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new d.Buf8(2*o.w_size),o.head=new d.Buf16(o.hash_size),o.prev=new d.Buf16(o.w_size),o.lit_bufsize=1<<n+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new d.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=e,o.strategy=s,o.method=r,K(t)}var h,d=t("../utils/common"),u=t("./trees"),c=t("./adler32"),p=t("./crc32"),i=t("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,n=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;h=[new M(0,0,0,0,function(t,e){var r=65535;for(r>t.pending_buf_size-5&&(r=t.pending_buf_size-5);;){if(t.lookahead<=1){if(j(t),0===t.lookahead&&e===l)return A;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var i=t.block_start+r;if((0===t.strstart||t.strstart>=i)&&(t.lookahead=t.strstart-i,t.strstart=i,N(t,!1),0===t.strm.avail_out))return A;if(t.strstart-t.block_start>=t.w_size-z&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):(t.strstart>t.block_start&&(N(t,!1),t.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(t,e){return Y(t,e,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(t,e){return t&&t.state?2!==t.state.wrap?_:(t.state.gzhead=e,m):_},r.deflate=function(t,e){var r,i,n,s;if(!t||!t.state||e>5||0>e)return t?R(t,_):_;if(i=t.state,!t.output||!t.input&&0!==t.avail_in||666===i.status&&e!==f)return R(t,0===t.avail_out?-5:_);if(i.strm=t,r=i.last_flush,i.last_flush=e,i.status===C)if(2===i.wrap)t.adler=0,U(i,31),U(i,139),U(i,8),i.gzhead?(U(i,(i.gzhead.text?1:0)+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)),U(i,255&i.gzhead.time),U(i,i.gzhead.time>>8&255),U(i,i.gzhead.time>>16&255),U(i,i.gzhead.time>>24&255),U(i,9===i.level?2:2<=i.strategy||i.level<2?4:0),U(i,255&i.gzhead.os),i.gzhead.extra&&i.gzhead.extra.length&&(U(i,255&i.gzhead.extra.length),U(i,i.gzhead.extra.length>>8&255)),i.gzhead.hcrc&&(t.adler=p(t.adler,i.pending_buf,i.pending,0)),i.gzindex=0,i.status=69):(U(i,0),U(i,0),U(i,0),U(i,0),U(i,0),U(i,9===i.level?2:2<=i.strategy||i.level<2?4:0),U(i,3),i.status=E);else{var a=v+(i.w_bits-8<<4)<<8;a|=(2<=i.strategy||i.level<2?0:i.level<6?1:6===i.level?2:3)<<6,0!==i.strstart&&(a|=32),a+=31-a%31,i.status=E,P(i,a),0!==i.strstart&&(P(i,t.adler>>>16),P(i,65535&t.adler)),t.adler=1}if(69===i.status)if(i.gzhead.extra){for(n=i.pending;i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending!==i.pending_buf_size));)U(i,255&i.gzhead.extra[i.gzindex]),i.gzindex++;i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),i.gzindex===i.gzhead.extra.length&&(i.gzindex=0,i.status=73)}else i.status=73;if(73===i.status)if(i.gzhead.name){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending===i.pending_buf_size)){s=1;break}s=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0,U(i,s)}while(0!==s);i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),0===s&&(i.gzindex=0,i.status=91)}else i.status=91;if(91===i.status)if(i.gzhead.comment){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending===i.pending_buf_size)){s=1;break}s=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0,U(i,s)}while(0!==s);i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),0===s&&(i.status=103)}else i.status=103;if(103===i.status&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&F(t),i.pending+2<=i.pending_buf_size&&(U(i,255&t.adler),U(i,t.adler>>8&255),t.adler=0,i.status=E)):i.status=E),0!==i.pending){if(F(t),0===t.avail_out)return i.last_flush=-1,m}else if(0===t.avail_in&&T(e)<=T(r)&&e!==f)return R(t,-5);if(666===i.status&&0!==t.avail_in)return R(t,-5);if(0!==t.avail_in||0!==i.lookahead||e!==l&&666!==i.status){var o=2===i.strategy?function(t,e){for(var r;;){if(0===t.lookahead&&(j(t),0===t.lookahead)){if(e===l)return A;break}if(t.match_length=0,r=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,r&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}(i,e):3===i.strategy?function(t,e){for(var r,i,n,s,a=t.window;;){if(t.lookahead<=S){if(j(t),t.lookahead<=S&&e===l)return A;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=x&&0<t.strstart&&(i=a[n=t.strstart-1])===a[++n]&&i===a[++n]&&i===a[++n]){s=t.strstart+S;do;while(i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&s>n);t.match_length=S-(s-n),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=x?(r=u._tr_tally(t,1,t.match_length-x),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(r=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),r&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}(i,e):h[i.level].func(i,e);if(o!==O&&o!==B||(i.status=666),o===A||o===O)return 0===t.avail_out&&(i.last_flush=-1),m;if(o===I&&(1===e?u._tr_align(i):5!==e&&(u._tr_stored_block(i,0,0,!1),3===e&&(D(i.head),0===i.lookahead&&(i.strstart=0,i.block_start=0,i.insert=0))),F(t),0===t.avail_out))return i.last_flush=-1,m}return e!==f?m:i.wrap<=0?1:(2===i.wrap?(U(i,255&t.adler),U(i,t.adler>>8&255),U(i,t.adler>>16&255),U(i,t.adler>>24&255),U(i,255&t.total_in),U(i,t.total_in>>8&255),U(i,t.total_in>>16&255),U(i,t.total_in>>24&255)):(P(i,t.adler>>>16),P(i,65535&t.adler)),F(t),0<i.wrap&&(i.wrap=-i.wrap),0!==i.pending?m:1)},r.deflateEnd=function(t){var e;return t&&t.state?(e=t.state.status)!==C&&69!==e&&73!==e&&91!==e&&103!==e&&e!==E&&666!==e?R(t,_):(t.state=null,e===E?R(t,-3):m):_},r.deflateSetDictionary=function(t,e){var r,i,n,s,a,o,h,u,l=e.length;if(!t||!t.state)return _;if(2===(s=(r=t.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(t.adler=c(t.adler,e,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new d.Buf8(r.w_size),d.arraySet(u,e,l-r.w_size,r.w_size,0),e=u,l=r.w_size),a=t.avail_in,o=t.next_in,h=t.input,t.avail_in=l,t.next_in=0,t.input=e,j(r);r.lookahead>=x;){for(i=r.strstart,n=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[i+x-1])&r.hash_mask,r.prev[i&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=i,i++,--n;);r.strstart=i,r.lookahead=x-1,j(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,t.next_in=o,t.input=h,t.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(t,e,r){"use strict";e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(t,e,r){"use strict";e.exports=function(t,e){var r,i,n,s,a,o,h,u,l,f,d,c,p,m,_,g,b,v,y,w,k,x,S,z,C;r=t.state,i=t.next_in,z=t.input,n=i+(t.avail_in-5),s=t.next_out,C=t.output,a=s-(e-t.avail_out),o=s+(t.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,d=r.window,c=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;t:do{15>p&&(c+=z[i++]<<p,p+=8,c+=z[i++]<<p,p+=8),v=m[c&g];e:for(;;){if(c>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else{if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(c&(1<<y)-1)];continue e}if(32&y){r.mode=12;break t}t.msg="invalid literal/length code",r.mode=30;break t}w=65535&v,(y&=15)&&(y>p&&(c+=z[i++]<<p,p+=8),w+=c&(1<<y)-1,c>>>=y,p-=y),15>p&&(c+=z[i++]<<p,p+=8,c+=z[i++]<<p,p+=8),v=_[c&b];r:for(;;){if(c>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(c&(1<<y)-1)];continue r}t.msg="invalid distance code",r.mode=30;break t}if(k=65535&v,p<(y&=15)&&(c+=z[i++]<<p,(p+=8)<y&&(c+=z[i++]<<p,p+=8)),h<(k+=c&(1<<y)-1)){t.msg="invalid distance too far back",r.mode=30;break t}if(c>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){t.msg="invalid distance too far back",r.mode=30;break t}if(S=d,(x=0)===f){if(x+=u-y,w>y){for(w-=y;C[s++]=d[x++],--y;);x=s-k,S=C}}else if(y>f){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=d[x++],--y;);if(x=0,w>f){for(w-=y=f;C[s++]=d[x++],--y;);x=s-k,S=C}}}else if(x+=f-y,w>y){for(w-=y;C[s++]=d[x++],--y;);x=s-k,S=C}for(;w>2;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],w>1&&(C[s++]=S[x++]))}else{for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],w>1&&(C[s++]=C[x++]))}break}}break}}while(n>i&&o>s);i-=w=p>>3,c&=(1<<(p-=w<<3))-1,t.next_in=i,t.next_out=s,t.avail_in=n>i?n-i+5:5-(i-n),t.avail_out=o>s?o-s+257:257-(s-o),r.hold=c,r.bits=p}},{}],49:[function(t,e,r){"use strict";function L(t){return(t>>>24&255)+(t>>>8&65280)+((65280&t)<<8)+((255&t)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function a(t){var e;return t&&t.state?(e=t.state,t.total_in=t.total_out=e.total=0,t.msg="",e.wrap&&(t.adler=1&e.wrap),e.mode=P,e.last=0,e.havedict=0,e.dmax=32768,e.head=null,e.hold=0,e.bits=0,e.lencode=e.lendyn=new I.Buf32(i),e.distcode=e.distdyn=new I.Buf32(n),e.sane=1,e.back=-1,N):U}function o(t){var e;return t&&t.state?((e=t.state).wsize=0,e.whave=0,e.wnext=0,a(t)):U}function h(t,e){var r,i;return t&&t.state?(i=t.state,0>e?(r=0,e=-e):(r=1+(e>>4),48>e&&(e&=15)),e&&(8>e||e>15)?U:(null!==i.window&&i.wbits!==e&&(i.window=null),i.wrap=r,i.wbits=e,o(t))):U}function u(t,e){var r,i;return t?(i=new s,(t.state=i).window=null,(r=h(t,e))!==N&&(t.state=null),r):U}function j(t){if(d){var e;for(l=new I.Buf32(512),f=new I.Buf32(32),e=0;144>e;)t.lens[e++]=8;for(;256>e;)t.lens[e++]=9;for(;280>e;)t.lens[e++]=7;for(;288>e;)t.lens[e++]=8;for(T(D,t.lens,0,288,l,0,t.work,{bits:9}),e=0;32>e;)t.lens[e++]=5;T(F,t.lens,0,32,f,0,t.work,{bits:5}),d=!1}t.lencode=l,t.lenbits=9,t.distcode=f,t.distbits=5}function Z(t,e,r,i){var n,s=t.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),i>=s.wsize?(I.arraySet(s.window,e,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(i<(n=s.wsize-s.wnext)&&(n=i),I.arraySet(s.window,e,r-i,n,s.wnext),(i-=n)?(I.arraySet(s.window,e,r-i,i,0),s.wnext=i,s.whave=s.wsize):(s.wnext+=n,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=n))),0}var l,f,I=t("../utils/common"),O=t("./adler32"),B=t("./crc32"),R=t("./inffast"),T=t("./inftrees"),D=1,F=2,N=0,U=-2,P=1,i=852,n=592,d=!0;r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(t){return u(t,15)},r.inflateInit2=u,r.inflate=function(t,e){var r,i,n,s,a,o,h,u,l,f,d,c,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!t||!t.state||!t.output||!t.input&&0!==t.avail_in)return U;12===(r=t.state).mode&&(r.mode=13),a=t.next_out,n=t.output,h=t.avail_out,s=t.next_in,i=t.input,o=t.avail_in,u=r.hold,l=r.bits,f=o,d=h,x=N;t:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;16>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){t.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){t.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){t.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,t.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;16>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(r.flags=u,8!=(255&r.flags)){t.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){t.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;32>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;16>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;16>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(c=r.length)&&(c=o),c&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,i,s,c,k)),512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,r.length-=c),r.length))break t;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break t;for(c=0;k=i[s+c++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&o>c;);if(512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,k)break t}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break t;for(c=0;k=i[s+c++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&o>c;);if(512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,k)break t}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;16>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(u!==(65535&r.check)){t.msg="header crc mismatch",r.mode=30;break}l=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),t.adler=r.check=0,r.mode=12;break;case 10:for(;32>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}t.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,2;t.adler=r.check=1,r.mode=12;case 12:if(5===e||6===e)break t;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;3>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==e)break;u>>>=2,l-=2;break t;case 2:r.mode=17;break;case 3:t.msg="invalid block type",r.mode=30}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;32>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if((65535&u)!=(u>>>16^65535)){t.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===e)break t;case 15:r.mode=16;case 16:if(c=r.length){if(c>o&&(c=o),c>h&&(c=h),0===c)break t;I.arraySet(n,i,s,c,a),o-=c,s+=c,h-=c,a+=c,r.length-=c;break}r.mode=12;break;case 17:for(;14>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){t.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;3>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){t.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(16>b)u>>>=_,l-=_,r.lens[r.have++]=b;else{if(16===b){for(z=_+2;z>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(u>>>=_,l-=_,0===r.have){t.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],c=3+(3&u),u>>>=2,l-=2}else if(17===b){for(z=_+3;z>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}l-=_,k=0,c=3+(7&(u>>>=_)),u>>>=3,l-=3}else{for(z=_+7;z>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}l-=_,k=0,c=11+(127&(u>>>=_)),u>>>=7,l-=7}if(r.have+c>r.nlen+r.ndist){t.msg="invalid bit length repeat",r.mode=30;break}for(;c--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){t.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){t.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){t.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===e)break t;case 20:r.mode=21;case 21:if(o>=6&&h>=258){t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,R(t,d),a=t.next_out,n=t.output,h=t.avail_out,s=t.next_in,i=t.input,o=t.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){t.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;z>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,64&g){t.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;z>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){t.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break t;if(c=d-h,r.offset>c){if((c=r.offset-c)>r.whave&&r.sane){t.msg="invalid distance too far back",r.mode=30;break}p=c>r.wnext?(c-=r.wnext,r.wsize-c):r.wnext-c,c>r.length&&(c=r.length),m=r.window}else m=n,p=a-r.offset,c=r.length;for(c>h&&(c=h),h-=c,r.length-=c;n[a++]=m[p++],--c;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break t;n[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;32>l;){if(0===o)break t;o--,u|=i[s++]<<l,l+=8}if(d-=h,t.total_out+=d,r.total+=d,d&&(t.adler=r.check=r.flags?B(r.check,n,d,a-d):O(r.check,n,d,a-d)),d=h,(r.flags?u:L(u))!==r.check){t.msg="incorrect data check",r.mode=30;break}l=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;32>l;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8}if(u!==(4294967295&r.total)){t.msg="incorrect length check",r.mode=30;break}l=u=0}r.mode=29;case 29:x=1;break t;case 30:x=-3;break t;case 31:return-4;case 32:default:return U}return t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,(r.wsize||d!==t.avail_out&&r.mode<30&&(r.mode<27||4!==e))&&Z(t,t.output,t.next_out,d-t.avail_out)?(r.mode=31,-4):(f-=t.avail_in,d-=t.avail_out,t.total_in+=f,t.total_out+=d,r.total+=d,r.wrap&&d&&(t.adler=r.check=r.flags?B(r.check,n,d,t.next_out-d):O(r.check,n,d,t.next_out-d)),t.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===d||4===e)&&x===N&&(x=-5),x)},r.inflateEnd=function(t){if(!t||!t.state)return U;var e=t.state;return e.window&&(e.window=null),t.state=null,N},r.inflateGetHeader=function(t,e){var r;return t&&t.state?0==(2&(r=t.state).wrap)?U:((r.head=e).done=!1,N):U},r.inflateSetDictionary=function(t,e){var r,i=e.length;return t&&t.state?0!==(r=t.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,e,i,0)!==r.check?-3:Z(t,e,i,i)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(t,e,r){"use strict";var D=t("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(t,e,r,i,n,s,a,o){var h,u,l,f,d,c,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;15>=b;b++)O[b]=0;for(v=0;i>v;v++)O[e[r+v]]++;for(k=g,w=15;w>=1&&0===O[w];w--);if(k>w&&(k=w),0===w)return n[s++]=20971520,n[s++]=20971520,o.bits=1,0;for(y=1;w>y&&0===O[y];y++);for(y>k&&(k=y),b=z=1;15>=b;b++)if(z<<=1,(z-=O[b])<0)return-1;if(z>0&&(0===t||1!==w))return-1;for(B[1]=0,b=1;15>b;b++)B[b+1]=B[b]+O[b];for(v=0;i>v;v++)0!==e[r+v]&&(a[B[e[r+v]]++]=v);if(c=0===t?(A=R=a,19):1===t?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,d=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===t&&C>852||2===t&&C>592)return 1;for(;;){for(p=b-S,_=a[v]<c?(m=0,a[v]):a[v]>c?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;n[d+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=e[r+a[v]]}if(b>k&&(E&f)!==l){for(0===S&&(S=k),d+=y,z=1<<(x=b-S);w>x+S&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===t&&C>852||2===t&&C>592)return 1;n[l=E&f]=k<<24|x<<16|d-s|0}}return 0!==E&&(n[d+E]=b-S<<24|64<<16|0),o.bits=k,0}},{"../utils/common":41}],51:[function(t,e,r){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(t,e,r){"use strict";function i(t){for(var e=t.length;0<=--e;)t[e]=0}function D(t,e,r,i,n){this.static_tree=t,this.extra_bits=e,this.extra_base=r,this.elems=i,this.max_length=n,this.has_stree=t&&t.length}function F(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}function N(t){return 256>t?E[t]:E[256+(t>>>7)]}function U(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function P(t,e,r){t.bi_valid>c-r?(t.bi_buf|=e<<t.bi_valid&65535,U(t,t.bi_buf),t.bi_buf=e>>c-t.bi_valid,t.bi_valid+=r-c):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=r)}function L(t,e,r){P(t,r[2*e],r[2*e+1])}function j(t,e){for(var r=0;r|=1&t,t>>>=1,r<<=1,0<--e;);return r>>>1}function Z(t,e,r){var i,n,s=new Array(g+1),a=0;for(i=1;g>=i;i++)s[i]=a=a+r[i-1]<<1;for(n=0;e>=n;n++){var o=t[2*n+1];0!==o&&(t[2*n]=j(s[o]++,o))}}function W(t){var e;for(e=0;l>e;e++)t.dyn_ltree[2*e]=0;for(e=0;f>e;e++)t.dyn_dtree[2*e]=0;for(e=0;d>e;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*m]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function M(t){8<t.bi_valid?U(t,t.bi_buf):0<t.bi_valid&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function H(t,e,r,i){var n=2*e,s=2*r;return t[n]<t[s]||t[n]===t[s]&&i[e]<=i[r]}function G(t,e,r){for(var i=t.heap[r],n=r<<1;n<=t.heap_len&&(n<t.heap_len&&H(e,t.heap[n+1],t.heap[n],t.depth)&&n++,!H(e,i,t.heap[n],t.depth));)t.heap[r]=t.heap[n],r=n,n<<=1;t.heap[r]=i}function K(t,e,r){var i,n,s,a,o=0;if(0!==t.last_lit)for(;i=t.pending_buf[t.d_buf+2*o]<<8|t.pending_buf[t.d_buf+2*o+1],n=t.pending_buf[t.l_buf+o],o++,0===i?L(t,n,e):(L(t,(s=A[n])+u+1,e),0!==(a=w[s])&&P(t,n-=I[s],a),L(t,s=N(--i),r),0!==(a=k[s])&&P(t,i-=T[s],a)),o<t.last_lit;);L(t,m,e)}function Y(t,e){var r,i,n,s=e.dyn_tree,a=e.stat_desc.static_tree,o=e.stat_desc.has_stree,h=e.stat_desc.elems,u=-1;for(t.heap_len=0,t.heap_max=_,r=0;h>r;r++)0!==s[2*r]?(t.heap[++t.heap_len]=u=r,t.depth[r]=0):s[2*r+1]=0;for(;t.heap_len<2;)s[2*(n=t.heap[++t.heap_len]=2>u?++u:0)]=1,t.depth[n]=0,t.opt_len--,o&&(t.static_len-=a[2*n+1]);for(e.max_code=u,r=t.heap_len>>1;r>=1;r--)G(t,s,r);for(n=h;r=t.heap[1],t.heap[1]=t.heap[t.heap_len--],G(t,s,1),i=t.heap[1],t.heap[--t.heap_max]=r,t.heap[--t.heap_max]=i,s[2*n]=s[2*r]+s[2*i],t.depth[n]=(t.depth[r]>=t.depth[i]?t.depth[r]:t.depth[i])+1,s[2*r+1]=s[2*i+1]=n,t.heap[1]=n++,G(t,s,1),2<=t.heap_len;);t.heap[--t.heap_max]=t.heap[1],function(t,e){var r,i,n,s,a,o,h=e.dyn_tree,u=e.max_code,l=e.stat_desc.static_tree,f=e.stat_desc.has_stree,d=e.stat_desc.extra_bits,c=e.stat_desc.extra_base,p=e.stat_desc.max_length,m=0;for(s=0;g>=s;s++)t.bl_count[s]=0;for(h[2*t.heap[t.heap_max]+1]=0,r=t.heap_max+1;_>r;r++)p<(s=h[2*h[2*(i=t.heap[r])+1]+1]+1)&&(s=p,m++),h[2*i+1]=s,i>u||(t.bl_count[s]++,a=0,i>=c&&(a=d[i-c]),o=h[2*i],t.opt_len+=o*(s+a),f&&(t.static_len+=o*(l[2*i+1]+a)));if(0!==m){do{for(s=p-1;0===t.bl_count[s];)s--;t.bl_count[s]--,t.bl_count[s+1]+=2,t.bl_count[p]--,m-=2}while(m>0);for(s=p;0!==s;s--)for(i=t.bl_count[s];0!==i;)u<(n=t.heap[--r])||(h[2*n+1]!==s&&(t.opt_len+=(s-h[2*n+1])*h[2*n],h[2*n+1]=s),i--)}}(t,e),Z(s,u,t.bl_count)}function X(t,e,r){var i,n,s=-1,a=e[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),e[2*(r+1)+1]=65535,i=0;r>=i;i++)n=a,a=e[2*(i+1)+1],++o<h&&n===a||(u>o?t.bl_tree[2*n]+=o:0!==n?(n!==s&&t.bl_tree[2*n]++,t.bl_tree[2*b]++):10>=o?t.bl_tree[2*v]++:t.bl_tree[2*y]++,s=n,u=(o=0)===a?(h=138,3):n===a?(h=6,3):(h=7,4))}function V(t,e,r){var i,n,s=-1,a=e[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),i=0;r>=i;i++)if(n=a,a=e[2*(i+1)+1],!(++o<h&&n===a)){if(u>o)for(;L(t,n,t.bl_tree),0!=--o;);else 0!==n?(n!==s&&(L(t,n,t.bl_tree),o--),L(t,b,t.bl_tree),P(t,o-3,2)):10>=o?(L(t,v,t.bl_tree),P(t,o-3,3)):(L(t,y,t.bl_tree),P(t,o-11,7));s=n,u=(o=0)===a?(h=138,3):n===a?(h=6,3):(h=7,4)}}function J(t,e,r,i){P(t,(s<<1)+(i?1:0),3),function(t,e,r,i){M(t),i&&(U(t,r),U(t,~r)),n.arraySet(t.pending_buf,t.window,e,r,t.pending),t.pending+=r}(t,e,r,!0)}var n=t("../utils/common"),o=0,h=1,s=0,a=29,u=256,l=u+1+a,f=30,d=19,_=2*l+1,g=15,c=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));i(z);var C=new Array(2*f);i(C);var E=new Array(512);i(E);var A=new Array(256);i(A);var I=new Array(a);i(I);var O,B,R,T=new Array(f);i(T);var q=!1;r._tr_init=function(t){q||(function(){var t,e,r,i,n,s=new Array(g+1);for(i=r=0;a-1>i;i++)for(I[i]=r,t=0;t<1<<w[i];t++)A[r++]=i;for(A[r-1]=i,i=n=0;16>i;i++)for(T[i]=n,t=0;t<1<<k[i];t++)E[n++]=i;for(n>>=7;f>i;i++)for(T[i]=n<<7,t=0;t<1<<k[i]-7;t++)E[256+n++]=i;for(e=0;g>=e;e++)s[e]=0;for(t=0;143>=t;)z[2*t+1]=8,t++,s[8]++;for(;255>=t;)z[2*t+1]=9,t++,s[9]++;for(;279>=t;)z[2*t+1]=7,t++,s[7]++;for(;287>=t;)z[2*t+1]=8,t++,s[8]++;for(Z(z,l+1,s),t=0;f>t;t++)C[2*t+1]=5,C[2*t]=j(t,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,d,p)}(),q=!0),t.l_desc=new F(t.dyn_ltree,O),t.d_desc=new F(t.dyn_dtree,B),t.bl_desc=new F(t.bl_tree,R),t.bi_buf=0,t.bi_valid=0,W(t)},r._tr_stored_block=J,r._tr_flush_block=function(t,e,r,i){var n,s,a=0;0<t.level?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,r=4093624447;for(e=0;31>=e;e++,r>>>=1)if(1&r&&0!==t.dyn_ltree[2*e])return o;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return h;for(e=32;u>e;e++)if(0!==t.dyn_ltree[2*e])return h;return o}(t)),Y(t,t.l_desc),Y(t,t.d_desc),a=function(t){var e;for(X(t,t.dyn_ltree,t.l_desc.max_code),X(t,t.dyn_dtree,t.d_desc.max_code),Y(t,t.bl_desc),e=d-1;e>=3&&0===t.bl_tree[2*S[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),n=t.opt_len+3+7>>>3,(s=t.static_len+3+7>>>3)<=n&&(n=s)):n=s=r+5,n>=r+4&&-1!==e?J(t,e,r,i):4===t.strategy||s===n?(P(t,2+(i?1:0),3),K(t,z,C)):(P(t,4+(i?1:0),3),function(t,e,r,i){var n;for(P(t,e-257,5),P(t,r-1,5),P(t,i-4,4),n=0;i>n;n++)P(t,t.bl_tree[2*S[n]+1],3);V(t,t.dyn_ltree,e-1),V(t,t.dyn_dtree,r-1)}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,a+1),K(t,t.dyn_ltree,t.dyn_dtree)),W(t),i&&M(t)},r._tr_tally=function(t,e,r){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&r,t.last_lit++,0===e?t.dyn_ltree[2*r]++:(t.matches++,e--,t.dyn_ltree[2*(A[r]+u+1)]++,t.dyn_dtree[2*N(e)]++),t.last_lit===t.lit_bufsize-1},r._tr_align=function(t){P(t,2,3),L(t,m,z),function(t){16===t.bi_valid?(U(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):8<=t.bi_valid&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}(t)}},{"../utils/common":41}],53:[function(t,e,r){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(t,e,r){"use strict";e.exports="function"==typeof setImmediate?setImmediate:function(){var t=[].slice.apply(arguments);t.splice(1,0,0),setTimeout.apply(null,t)}},{}]},{},[10])(10)})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},require("buffer").Buffer)},{buffer:48}],54:[function(require,module,exports){exports.Parser=require("./lib/parser").Parser,exports.rules=require("./lib/rules"),exports.errors=require("./lib/errors"),exports.results=require("./lib/parsing-results"),exports.StringSource=require("./lib/StringSource"),exports.Token=require("./lib/Token"),exports.bottomUp=require("./lib/bottom-up"),exports.RegexTokeniser=require("./lib/regex-tokeniser").RegexTokeniser,exports.rule=function(ruleBuilder){var rule;return function(input){return rule||(rule=ruleBuilder()),rule(input)}}},{"./lib/StringSource":55,"./lib/Token":56,"./lib/bottom-up":58,"./lib/errors":59,"./lib/parser":61,"./lib/parsing-results":62,"./lib/regex-tokeniser":63,"./lib/rules":64}],55:[function(require,module,exports){var StringSourceRange=(module.exports=function(string,description){
var self={asString:function(){return string},range:function(startIndex,endIndex){return new StringSourceRange(string,description,startIndex,endIndex)}};return self},function(string,description,startIndex,endIndex){this._string=string,this._description=description,this._startIndex=startIndex,this._endIndex=endIndex});StringSourceRange.prototype.to=function(otherRange){return new StringSourceRange(this._string,this._description,this._startIndex,otherRange._endIndex)},StringSourceRange.prototype.describe=function(){var position=this._position(),description=this._description?this._description+"\n":"";return description+"Line number: "+position.lineNumber+"\nCharacter number: "+position.characterNumber},StringSourceRange.prototype.lineNumber=function(){return this._position().lineNumber},StringSourceRange.prototype.characterNumber=function(){return this._position().characterNumber},StringSourceRange.prototype._position=function(){for(var self=this,index=0,nextNewLine=function(){return self._string.indexOf("\n",index)},lineNumber=1;-1!==nextNewLine()&&nextNewLine()<this._startIndex;)index=nextNewLine()+1,lineNumber+=1;var characterNumber=this._startIndex-index+1;return{lineNumber:lineNumber,characterNumber:characterNumber}}},{}],56:[function(require,module,exports){module.exports=function(name,value,source){this.name=name,this.value=value,source&&(this.source=source)}},{}],57:[function(require,module,exports){var TokenIterator=module.exports=function(tokens,startIndex){this._tokens=tokens,this._startIndex=startIndex||0};TokenIterator.prototype.head=function(){return this._tokens[this._startIndex]},TokenIterator.prototype.tail=function(startIndex){return new TokenIterator(this._tokens,this._startIndex+1)},TokenIterator.prototype.toArray=function(){return this._tokens.slice(this._startIndex)},TokenIterator.prototype.end=function(){return this._tokens[this._tokens.length-1]},TokenIterator.prototype.to=function(end){var start=this.head().source,endToken=end.head()||end.end();return start.to(endToken.source)}},{}],58:[function(require,module,exports){function InfixRules(infixRules){function untilExclusive(name){return new InfixRules(infixRules.slice(0,ruleNames().indexOf(name)))}function untilInclusive(name){return new InfixRules(infixRules.slice(0,ruleNames().indexOf(name)+1))}function ruleNames(){return infixRules.map(function(rule){return rule.name})}function apply(leftResult){for(var currentResult,source;;){if(currentResult=applyToTokens(leftResult.remaining()),!currentResult.isSuccess())return currentResult.isFailure()?leftResult:currentResult;source=leftResult.source().to(currentResult.source()),leftResult=results.success(currentResult.value()(leftResult.value(),source),currentResult.remaining(),source)}}function applyToTokens(tokens){return rules.firstOf("infix",infixRules.map(function(infix){return infix.rule}))(tokens)}return{apply:apply,untilExclusive:untilExclusive,untilInclusive:untilInclusive}}var rules=require("./rules"),results=require("./parsing-results");exports.parser=function(name,prefixRules,infixRuleBuilders){function createInfixRule(infixRuleBuilder){return{name:infixRuleBuilder.name,rule:lazyRule(infixRuleBuilder.ruleBuilder.bind(null,self))}}function rule(){return createRule(infixRules)}function leftAssociative(name){return createRule(infixRules.untilExclusive(name))}function rightAssociative(name){return createRule(infixRules.untilInclusive(name))}function createRule(infixRules){return apply.bind(null,infixRules)}function apply(infixRules,tokens){var leftResult=prefixRule(tokens);return leftResult.isSuccess()?infixRules.apply(leftResult):leftResult}var self={rule:rule,leftAssociative:leftAssociative,rightAssociative:rightAssociative},infixRules=new InfixRules(infixRuleBuilders.map(createInfixRule)),prefixRule=rules.firstOf(name,prefixRules);return self},exports.infix=function(name,ruleBuilder){function map(func){return exports.infix(name,function(parser){var rule=ruleBuilder(parser);return function(tokens){var result=rule(tokens);return result.map(function(right){return function(left,source){return func(left,right,source)}})}})}return{name:name,ruleBuilder:ruleBuilder,map:map}};var lazyRule=function(ruleBuilder){var rule;return function(input){return rule||(rule=ruleBuilder()),rule(input)}}},{"./parsing-results":62,"./rules":64}],59:[function(require,module,exports){exports.error=function(options){return new Error(options)};var Error=function(options){this.expected=options.expected,this.actual=options.actual,this._location=options.location};Error.prototype.describe=function(){var locationDescription=this._location?this._location.describe()+":\n":"";return locationDescription+"Expected "+this.expected+"\nbut got "+this.actual},Error.prototype.lineNumber=function(){return this._location.lineNumber()},Error.prototype.characterNumber=function(){return this._location.characterNumber()}},{}],60:[function(require,module,exports){var LazyIterator=(exports.fromArray=function(array){var index=0,hasNext=function(){return index<array.length};return new LazyIterator({hasNext:hasNext,next:function(){if(hasNext())return array[index++];throw new Error("No more elements")}})},function(iterator){this._iterator=iterator});LazyIterator.prototype.map=function(func){var iterator=this._iterator;return new LazyIterator({hasNext:function(){return iterator.hasNext()},next:function(){return func(iterator.next())}})},LazyIterator.prototype.filter=function(condition){var next,iterator=this._iterator,moved=!1,hasNext=!1,moveIfNecessary=function(){if(!moved)for(moved=!0,hasNext=!1;iterator.hasNext()&&!hasNext;)next=iterator.next(),hasNext=condition(next)};return new LazyIterator({hasNext:function(){return moveIfNecessary(),hasNext},next:function(){moveIfNecessary();var toReturn=next;return moved=!1,toReturn}})},LazyIterator.prototype.first=function(){var iterator=this._iterator;return this._iterator.hasNext()?iterator.next():null},LazyIterator.prototype.toArray=function(){for(var result=[];this._iterator.hasNext();)result.push(this._iterator.next());return result}},{}],61:[function(require,module,exports){var TokenIterator=require("./TokenIterator");exports.Parser=function(options){var parseTokens=function(parser,tokens){return parser(new TokenIterator(tokens))};return{parseTokens:parseTokens}}},{"./TokenIterator":57}],62:[function(require,module,exports){module.exports={failure:function(errors,remaining){if(errors.length<1)throw new Error("Failure must have errors");return new Result({status:"failure",remaining:remaining,errors:errors})},error:function(errors,remaining){if(errors.length<1)throw new Error("Failure must have errors");return new Result({status:"error",remaining:remaining,errors:errors})},success:function(value,remaining,source){return new Result({status:"success",value:value,source:source,remaining:remaining,errors:[]})},cut:function(remaining){return new Result({status:"cut",remaining:remaining,errors:[]})}};var Result=function(options){this._value=options.value,this._status=options.status,this._hasValue=void 0!==options.value,this._remaining=options.remaining,this._source=options.source,this._errors=options.errors};Result.prototype.map=function(func){return this._hasValue?new Result({value:func(this._value,this._source),status:this._status,remaining:this._remaining,source:this._source,errors:this._errors}):this},Result.prototype.changeRemaining=function(remaining){return new Result({value:this._value,status:this._status,remaining:remaining,source:this._source,errors:this._errors})},Result.prototype.isSuccess=function(){return"success"===this._status||"cut"===this._status},Result.prototype.isFailure=function(){return"failure"===this._status},Result.prototype.isError=function(){return"error"===this._status},Result.prototype.isCut=function(){return"cut"===this._status},Result.prototype.value=function(){return this._value},Result.prototype.remaining=function(){return this._remaining},Result.prototype.source=function(){return this._source},Result.prototype.errors=function(){return this._errors}},{}],63:[function(require,module,exports){function RegexTokeniser(rules){function tokenise(input,description){for(var source=new StringSource(input,description),index=0,tokens=[];index<input.length;){var result=readNextToken(input,index,source);index=result.endIndex,tokens.push(result.token)}return tokens.push(endToken(input,source)),tokens}function readNextToken(string,startIndex,source){for(var i=0;i<rules.length;i++){var regex=rules[i].regex;regex.lastIndex=startIndex;var result=regex.exec(string);if(result){var endIndex=startIndex+result[0].length;if(result.index===startIndex&&endIndex>startIndex){var value=result[1],token=new Token(rules[i].name,value,source.range(startIndex,endIndex));return{token:token,endIndex:endIndex}}}}var endIndex=startIndex+1,token=new Token("unrecognisedCharacter",string.substring(startIndex,endIndex),source.range(startIndex,endIndex));return{token:token,endIndex:endIndex}}function endToken(input,source){return new Token("end",null,source.range(input.length,input.length))}return rules=rules.map(function(rule){return{name:rule.name,regex:new RegExp(rule.regex.source,"g")}}),{tokenise:tokenise}}var Token=require("./Token"),StringSource=require("./StringSource");exports.RegexTokeniser=RegexTokeniser},{"./StringSource":55,"./Token":56}],64:[function(require,module,exports){function noOpRule(input){return results.success(null,input)}function describeTokenMismatch(input,expected){var error,token=input.head();return error=token?errors.error({expected:expected,actual:describeToken(token),location:token.source}):errors.error({expected:expected,actual:"end of tokens"}),results.failure([error],input)}var _=require("underscore"),options=require("option"),results=require("./parsing-results"),errors=require("./errors"),lazyIterators=require("./lazy-iterators");exports.token=function(tokenType,value){var matchValue=void 0!==value;return function(input){var token=input.head();if(!token||token.name!==tokenType||matchValue&&token.value!==value){var expected=describeToken({name:tokenType,value:value});return describeTokenMismatch(input,expected)}return results.success(token.value,input.tail(),token.source)}},exports.tokenOfType=function(tokenType){return exports.token(tokenType)},exports.firstOf=function(name,parsers){return _.isArray(parsers)||(parsers=Array.prototype.slice.call(arguments,1)),function(input){return lazyIterators.fromArray(parsers).map(function(parser){return parser(input)}).filter(function(result){return result.isSuccess()||result.isError()}).first()||describeTokenMismatch(input,name)}},exports.then=function(parser,func){return function(input){var result=parser(input);return result.map||console.log(result),result.map(func)}},exports.sequence=function(){function isCapturedRule(subRule){return subRule.isCaptured}var parsers=Array.prototype.slice.call(arguments,0),rule=function(input){var result=_.foldl(parsers,function(memo,parser){var result=memo.result,hasCut=memo.hasCut;if(!result.isSuccess())return{result:result,hasCut:hasCut};var subResult=parser(result.remaining());if(subResult.isCut())return{result:result,hasCut:!0};if(subResult.isSuccess()){var values;values=parser.isCaptured?result.value().withValue(parser,subResult.value()):result.value();var remaining=subResult.remaining(),source=input.to(remaining);return{result:results.success(values,remaining,source),hasCut:hasCut}}return hasCut?{result:results.error(subResult.errors(),subResult.remaining()),hasCut:hasCut}:{result:subResult,hasCut:hasCut}},{result:results.success(new SequenceValues,input),hasCut:!1}).result,source=input.to(result.remaining());return result.map(function(values){return values.withValue(exports.sequence.source,source)})};return rule.head=function(){var firstCapture=_.find(parsers,isCapturedRule);return exports.then(rule,exports.sequence.extract(firstCapture))},rule.map=function(func){return exports.then(rule,function(result){return func.apply(this,result.toArray())})},rule};var SequenceValues=function(values,valuesArray){this._values=values||{},this._valuesArray=valuesArray||[]};SequenceValues.prototype.withValue=function(rule,value){if(rule.captureName&&rule.captureName in this._values)throw new Error('Cannot add second value for capture "'+rule.captureName+'"');var newValues=_.clone(this._values);newValues[rule.captureName]=value;var newValuesArray=this._valuesArray.concat([value]);return new SequenceValues(newValues,newValuesArray)},SequenceValues.prototype.get=function(rule){if(rule.captureName in this._values)return this._values[rule.captureName];throw new Error('No value for capture "'+rule.captureName+'"')},SequenceValues.prototype.toArray=function(){return this._valuesArray},exports.sequence.capture=function(rule,name){var captureRule=function(){return rule.apply(this,arguments)};return captureRule.captureName=name,captureRule.isCaptured=!0,captureRule},exports.sequence.extract=function(rule){return function(result){return result.get(rule)}},exports.sequence.applyValues=function(func){var rules=Array.prototype.slice.call(arguments,1);return function(result){var values=rules.map(function(rule){return result.get(rule)});return func.apply(this,values)}},exports.sequence.source={captureName:"☃source☃"},exports.sequence.cut=function(){return function(input){return results.cut(input)}},exports.optional=function(rule){return function(input){var result=rule(input);return result.isSuccess()?result.map(options.some):result.isFailure()?results.success(options.none,input):result}},exports.zeroOrMoreWithSeparator=function(rule,separator){return repeatedWithSeparator(rule,separator,!1)},exports.oneOrMoreWithSeparator=function(rule,separator){return repeatedWithSeparator(rule,separator,!0)};var zeroOrMore=exports.zeroOrMore=function(rule){return function(input){for(var result,values=[];(result=rule(input))&&result.isSuccess();)input=result.remaining(),values.push(result.value());return result.isError()?result:results.success(values,input)}};exports.oneOrMore=function(rule){return exports.oneOrMoreWithSeparator(rule,noOpRule)};var repeatedWithSeparator=function(rule,separator,isOneOrMore){return function(input){var result=rule(input);if(result.isSuccess()){var mainRule=exports.sequence.capture(rule,"main"),remainingRule=zeroOrMore(exports.then(exports.sequence(separator,mainRule),exports.sequence.extract(mainRule))),remainingResult=remainingRule(result.remaining());return results.success([result.value()].concat(remainingResult.value()),remainingResult.remaining())}return isOneOrMore||result.isError()?result:results.success([],input)}};exports.leftAssociative=function(leftRule,rightRule,func){var rights;rights=func?[{func:func,rule:rightRule}]:rightRule,rights=rights.map(function(right){return exports.then(right.rule,function(rightValue){return function(leftValue,source){return right.func(leftValue,rightValue,source)}})});var repeatedRule=exports.firstOf.apply(null,["rules"].concat(rights));return function(input){var start=input,leftResult=leftRule(input);if(!leftResult.isSuccess())return leftResult;for(var repeatedResult=repeatedRule(leftResult.remaining());repeatedResult.isSuccess();){var remaining=repeatedResult.remaining(),source=start.to(repeatedResult.remaining()),right=repeatedResult.value();leftResult=results.success(right(leftResult.value(),source),remaining,source),repeatedResult=repeatedRule(leftResult.remaining())}return repeatedResult.isError()?repeatedResult:leftResult}},exports.leftAssociative.firstOf=function(){return Array.prototype.slice.call(arguments,0)},exports.nonConsuming=function(rule){return function(input){return rule(input).changeRemaining(input)}};var describeToken=function(token){return token.value?token.name+' "'+token.value+'"':token.name}},{"./errors":59,"./lazy-iterators":60,"./parsing-results":62,option:65,underscore:67}],65:[function(require,module,exports){function callOrReturn(value){return"function"==typeof value?value():value}exports.none=Object.create({value:function(){throw new Error("Called value on none")},isNone:function(){return!0},isSome:function(){return!1},map:function(){return exports.none},flatMap:function(){return exports.none},filter:function(){return exports.none},toArray:function(){return[]},orElse:callOrReturn,valueOrElse:callOrReturn}),exports.some=function(value){return new Some(value)};var Some=function(value){this._value=value};Some.prototype.value=function(){return this._value},Some.prototype.isNone=function(){return!1},Some.prototype.isSome=function(){return!0},Some.prototype.map=function(func){return new Some(func(this._value))},Some.prototype.flatMap=function(func){return func(this._value)},Some.prototype.filter=function(predicate){return predicate(this._value)?this:exports.none},Some.prototype.toArray=function(){return[this._value]},Some.prototype.orElse=function(value){return this},Some.prototype.valueOrElse=function(value){return this._value},exports.isOption=function(value){return value===exports.none||value instanceof Some},exports.fromNullable=function(value){return null==value?exports.none:new Some(value)}},{}],66:[function(require,module,exports){function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}function runTimeout(fun){if(cachedSetTimeout===setTimeout)return setTimeout(fun,0);if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout)return cachedSetTimeout=setTimeout,setTimeout(fun,0);try{return cachedSetTimeout(fun,0)}catch(e){try{return cachedSetTimeout.call(null,fun,0)}catch(e){return cachedSetTimeout.call(this,fun,0)}}}function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout)return clearTimeout(marker);if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout)return cachedClearTimeout=clearTimeout,clearTimeout(marker);try{return cachedClearTimeout(marker)}catch(e){try{return cachedClearTimeout.call(null,marker)}catch(e){return cachedClearTimeout.call(this,marker)}}}function cleanUpNextTick(){draining&&currentQueue&&(draining=!1,currentQueue.length?queue=currentQueue.concat(queue):queueIndex=-1,queue.length&&drainQueue())}function drainQueue(){if(!draining){var timeout=runTimeout(cleanUpNextTick);draining=!0;for(var len=queue.length;len;){for(currentQueue=queue,queue=[];++queueIndex<len;)currentQueue&&currentQueue[queueIndex].run();queueIndex=-1,len=queue.length}currentQueue=null,draining=!1,runClearTimeout(timeout)}}function Item(fun,array){this.fun=fun,this.array=array}function noop(){}var cachedSetTimeout,cachedClearTimeout,process=module.exports={};!function(){try{cachedSetTimeout="function"==typeof setTimeout?setTimeout:defaultSetTimout}catch(e){cachedSetTimeout=defaultSetTimout}try{cachedClearTimeout="function"==typeof clearTimeout?clearTimeout:defaultClearTimeout}catch(e){cachedClearTimeout=defaultClearTimeout}}();var currentQueue,queue=[],draining=!1,queueIndex=-1;process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1)for(var i=1;i<arguments.length;i++)args[i-1]=arguments[i];queue.push(new Item(fun,args)),1!==queue.length||draining||runTimeout(drainQueue)},Item.prototype.run=function(){this.fun.apply(null,this.array)},process.title="browser",process.browser=!0,process.env={},process.argv=[],process.version="",process.versions={},process.on=noop,process.addListener=noop,process.once=noop,process.off=noop,process.removeListener=noop,process.removeAllListeners=noop,process.emit=noop,process.binding=function(name){throw new Error("process.binding is not supported")},process.cwd=function(){return"/"},process.chdir=function(dir){throw new Error("process.chdir is not supported")},process.umask=function(){return 0}},{}],67:[function(require,module,exports){(function(global){!function(global,factory){"object"==typeof exports&&"undefined"!=typeof module?module.exports=factory():"function"==typeof define&&define.amd?define("underscore",factory):(global="undefined"!=typeof globalThis?globalThis:global||self,function(){var current=global._,exports=global._=factory();exports.noConflict=function(){return global._=current,exports}}())}(this,function(){function restArguments(func,startIndex){return startIndex=null==startIndex?func.length-1:+startIndex,function(){for(var length=Math.max(arguments.length-startIndex,0),rest=Array(length),index=0;length>index;index++)rest[index]=arguments[index+startIndex];switch(startIndex){case 0:return func.call(this,rest);case 1:return func.call(this,arguments[0],rest);case 2:return func.call(this,arguments[0],arguments[1],rest)}var args=Array(startIndex+1);for(index=0;startIndex>index;index++)args[index]=arguments[index];return args[startIndex]=rest,func.apply(this,args)}}function isObject(obj){var type=typeof obj;return"function"===type||"object"===type&&!!obj}function isNull(obj){return null===obj}function isUndefined(obj){return void 0===obj}function isBoolean(obj){return obj===!0||obj===!1||"[object Boolean]"===toString.call(obj)}function isElement(obj){return!(!obj||1!==obj.nodeType)}function tagTester(name){var tag="[object "+name+"]";return function(obj){return toString.call(obj)===tag}}function ie10IsDataView(obj){return null!=obj&&isFunction$1(obj.getInt8)&&isArrayBuffer(obj.buffer)}function has$1(obj,key){return null!=obj&&hasOwnProperty.call(obj,key)}function isFinite$1(obj){return!isSymbol(obj)&&_isFinite(obj)&&!isNaN(parseFloat(obj))}function isNaN$1(obj){return isNumber(obj)&&_isNaN(obj)}function constant(value){return function(){return value}}function createSizePropertyCheck(getSizeProperty){return function(collection){var sizeProperty=getSizeProperty(collection);return"number"==typeof sizeProperty&&sizeProperty>=0&&MAX_ARRAY_INDEX>=sizeProperty}}function shallowProperty(key){return function(obj){return null==obj?void 0:obj[key]}}function isTypedArray(obj){return nativeIsView?nativeIsView(obj)&&!isDataView$1(obj):isBufferLike(obj)&&typedArrayPattern.test(toString.call(obj))}function emulatedSet(keys){for(var hash={},l=keys.length,i=0;l>i;++i)hash[keys[i]]=!0;return{contains:function(key){return hash[key]},push:function(key){return hash[key]=!0,keys.push(key)}}}function collectNonEnumProps(obj,keys){keys=emulatedSet(keys);var nonEnumIdx=nonEnumerableProps.length,constructor=obj.constructor,proto=isFunction$1(constructor)&&constructor.prototype||ObjProto,prop="constructor";for(has$1(obj,prop)&&!keys.contains(prop)&&keys.push(prop);nonEnumIdx--;)prop=nonEnumerableProps[nonEnumIdx],prop in obj&&obj[prop]!==proto[prop]&&!keys.contains(prop)&&keys.push(prop)}function keys(obj){if(!isObject(obj))return[];if(nativeKeys)return nativeKeys(obj);var keys=[];for(var key in obj)has$1(obj,key)&&keys.push(key);return hasEnumBug&&collectNonEnumProps(obj,keys),keys}function isEmpty(obj){if(null==obj)return!0;var length=getLength(obj);return"number"==typeof length&&(isArray(obj)||isString(obj)||isArguments$1(obj))?0===length:0===getLength(keys(obj))}function isMatch(object,attrs){var _keys=keys(attrs),length=_keys.length;if(null==object)return!length;for(var obj=Object(object),i=0;length>i;i++){var key=_keys[i];if(attrs[key]!==obj[key]||!(key in obj))return!1}return!0}function _$1(obj){return obj instanceof _$1?obj:this instanceof _$1?void(this._wrapped=obj):new _$1(obj)}function toBufferView(bufferSource){return new Uint8Array(bufferSource.buffer||bufferSource,bufferSource.byteOffset||0,getByteLength(bufferSource))}function eq(a,b,aStack,bStack){if(a===b)return 0!==a||1/a===1/b;if(null==a||null==b)return!1;if(a!==a)return b!==b;var type=typeof a;return"function"!==type&&"object"!==type&&"object"!=typeof b?!1:deepEq(a,b,aStack,bStack)}function deepEq(a,b,aStack,bStack){a instanceof _$1&&(a=a._wrapped),b instanceof _$1&&(b=b._wrapped);var className=toString.call(a);if(className!==toString.call(b))return!1;if(hasStringTagBug&&"[object Object]"==className&&isDataView$1(a)){if(!isDataView$1(b))return!1;className=tagDataView}switch(className){case"[object RegExp]":case"[object String]":return""+a==""+b;case"[object Number]":return+a!==+a?+b!==+b:0===+a?1/+a===1/b:+a===+b;case"[object Date]":case"[object Boolean]":return+a===+b;case"[object Symbol]":return SymbolProto.valueOf.call(a)===SymbolProto.valueOf.call(b);case"[object ArrayBuffer]":case tagDataView:return deepEq(toBufferView(a),toBufferView(b),aStack,bStack)}var areArrays="[object Array]"===className;if(!areArrays&&isTypedArray$1(a)){var byteLength=getByteLength(a);if(byteLength!==getByteLength(b))return!1;if(a.buffer===b.buffer&&a.byteOffset===b.byteOffset)return!0;areArrays=!0}if(!areArrays){if("object"!=typeof a||"object"!=typeof b)return!1;var aCtor=a.constructor,bCtor=b.constructor;if(aCtor!==bCtor&&!(isFunction$1(aCtor)&&aCtor instanceof aCtor&&isFunction$1(bCtor)&&bCtor instanceof bCtor)&&"constructor"in a&&"constructor"in b)return!1}aStack=aStack||[],bStack=bStack||[];for(var length=aStack.length;length--;)if(aStack[length]===a)return bStack[length]===b;if(aStack.push(a),bStack.push(b),areArrays){if(length=a.length,length!==b.length)return!1;for(;length--;)if(!eq(a[length],b[length],aStack,bStack))return!1}else{var key,_keys=keys(a);if(length=_keys.length,keys(b).length!==length)return!1;for(;length--;)if(key=_keys[length],!has$1(b,key)||!eq(a[key],b[key],aStack,bStack))return!1}return aStack.pop(),bStack.pop(),!0}function isEqual(a,b){return eq(a,b)}function allKeys(obj){if(!isObject(obj))return[];var keys=[];for(var key in obj)keys.push(key);return hasEnumBug&&collectNonEnumProps(obj,keys),keys}function ie11fingerprint(methods){var length=getLength(methods);return function(obj){if(null==obj)return!1;var keys=allKeys(obj);if(getLength(keys))return!1;for(var i=0;length>i;i++)if(!isFunction$1(obj[methods[i]]))return!1;return methods!==weakMapMethods||!isFunction$1(obj[forEachName])}}function values(obj){for(var _keys=keys(obj),length=_keys.length,values=Array(length),i=0;length>i;i++)values[i]=obj[_keys[i]];return values}function pairs(obj){for(var _keys=keys(obj),length=_keys.length,pairs=Array(length),i=0;length>i;i++)pairs[i]=[_keys[i],obj[_keys[i]]];return pairs}function invert(obj){for(var result={},_keys=keys(obj),i=0,length=_keys.length;length>i;i++)result[obj[_keys[i]]]=_keys[i];return result}function functions(obj){var names=[];for(var key in obj)isFunction$1(obj[key])&&names.push(key);return names.sort()}function createAssigner(keysFunc,defaults){return function(obj){var length=arguments.length;if(defaults&&(obj=Object(obj)),2>length||null==obj)return obj;for(var index=1;length>index;index++)for(var source=arguments[index],keys=keysFunc(source),l=keys.length,i=0;l>i;i++){var key=keys[i];defaults&&void 0!==obj[key]||(obj[key]=source[key])}return obj}}function ctor(){return function(){}}function baseCreate(prototype){if(!isObject(prototype))return{};if(nativeCreate)return nativeCreate(prototype);var Ctor=ctor();Ctor.prototype=prototype;var result=new Ctor;return Ctor.prototype=null,result}function create(prototype,props){var result=baseCreate(prototype);return props&&extendOwn(result,props),result}function clone(obj){return isObject(obj)?isArray(obj)?obj.slice():extend({},obj):obj}function tap(obj,interceptor){return interceptor(obj),obj}function toPath$1(path){return isArray(path)?path:[path]}function toPath(path){return _$1.toPath(path)}function deepGet(obj,path){for(var length=path.length,i=0;length>i;i++){if(null==obj)return void 0;obj=obj[path[i]]}return length?obj:void 0}function get(object,path,defaultValue){var value=deepGet(object,toPath(path));return isUndefined(value)?defaultValue:value}function has(obj,path){path=toPath(path);for(var length=path.length,i=0;length>i;i++){var key=path[i];if(!has$1(obj,key))return!1;obj=obj[key]}return!!length}function identity(value){return value}function matcher(attrs){return attrs=extendOwn({},attrs),function(obj){return isMatch(obj,attrs)}}function property(path){return path=toPath(path),function(obj){return deepGet(obj,path)}}function optimizeCb(func,context,argCount){if(void 0===context)return func;switch(null==argCount?3:argCount){case 1:return function(value){return func.call(context,value)};case 3:return function(value,index,collection){return func.call(context,value,index,collection)};case 4:return function(accumulator,value,index,collection){return func.call(context,accumulator,value,index,collection)}}return function(){return func.apply(context,arguments)}}function baseIteratee(value,context,argCount){return null==value?identity:isFunction$1(value)?optimizeCb(value,context,argCount):isObject(value)&&!isArray(value)?matcher(value):property(value)}function iteratee(value,context){return baseIteratee(value,context,1/0)}function cb(value,context,argCount){return _$1.iteratee!==iteratee?_$1.iteratee(value,context):baseIteratee(value,context,argCount)}function mapObject(obj,iteratee,context){iteratee=cb(iteratee,context);for(var _keys=keys(obj),length=_keys.length,results={},index=0;length>index;index++){var currentKey=_keys[index];results[currentKey]=iteratee(obj[currentKey],currentKey,obj)}return results}function noop(){}function propertyOf(obj){return null==obj?noop:function(path){return get(obj,path)}}function times(n,iteratee,context){var accum=Array(Math.max(0,n));iteratee=optimizeCb(iteratee,context,1);for(var i=0;n>i;i++)accum[i]=iteratee(i);return accum}function random(min,max){return null==max&&(max=min,min=0),min+Math.floor(Math.random()*(max-min+1))}function createEscaper(map){var escaper=function(match){return map[match]},source="(?:"+keys(map).join("|")+")",testRegexp=RegExp(source),replaceRegexp=RegExp(source,"g");return function(string){return string=null==string?"":""+string,testRegexp.test(string)?string.replace(replaceRegexp,escaper):string}}function escapeChar(match){return"\\"+escapes[match]}function template(text,settings,oldSettings){!settings&&oldSettings&&(settings=oldSettings),settings=defaults({},settings,_$1.templateSettings);var matcher=RegExp([(settings.escape||noMatch).source,(settings.interpolate||noMatch).source,(settings.evaluate||noMatch).source].join("|")+"|$","g"),index=0,source="__p+='";text.replace(matcher,function(match,escape,interpolate,evaluate,offset){return source+=text.slice(index,offset).replace(escapeRegExp,escapeChar),index=offset+match.length,escape?source+="'+\n((__t=("+escape+"))==null?'':_.escape(__t))+\n'":interpolate?source+="'+\n((__t=("+interpolate+"))==null?'':__t)+\n'":evaluate&&(source+="';\n"+evaluate+"\n__p+='"),match}),source+="';\n";var argument=settings.variable;if(argument){if(!bareIdentifier.test(argument))throw new Error("variable is not a bare identifier: "+argument)}else source="with(obj||{}){\n"+source+"}\n",argument="obj";source="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+source+"return __p;\n";var render;try{render=new Function(argument,"_",source)}catch(e){throw e.source=source,e}var template=function(data){return render.call(this,data,_$1)};return template.source="function("+argument+"){\n"+source+"}",template}function result(obj,path,fallback){path=toPath(path);var length=path.length;if(!length)return isFunction$1(fallback)?fallback.call(obj):fallback;for(var i=0;length>i;i++){var prop=null==obj?void 0:obj[path[i]];void 0===prop&&(prop=fallback,i=length),obj=isFunction$1(prop)?prop.call(obj):prop}return obj}function uniqueId(prefix){var id=++idCounter+"";return prefix?prefix+id:id}function chain(obj){var instance=_$1(obj);return instance._chain=!0,instance}function executeBound(sourceFunc,boundFunc,context,callingContext,args){if(!(callingContext instanceof boundFunc))return sourceFunc.apply(context,args);var self=baseCreate(sourceFunc.prototype),result=sourceFunc.apply(self,args);return isObject(result)?result:self}function flatten$1(input,depth,strict,output){if(output=output||[],depth||0===depth){if(0>=depth)return output.concat(input)}else depth=1/0;for(var idx=output.length,i=0,length=getLength(input);length>i;i++){var value=input[i];if(isArrayLike(value)&&(isArray(value)||isArguments$1(value)))if(depth>1)flatten$1(value,depth-1,strict,output),
idx=output.length;else for(var j=0,len=value.length;len>j;)output[idx++]=value[j++];else strict||(output[idx++]=value)}return output}function memoize(func,hasher){var memoize=function(key){var cache=memoize.cache,address=""+(hasher?hasher.apply(this,arguments):key);return has$1(cache,address)||(cache[address]=func.apply(this,arguments)),cache[address]};return memoize.cache={},memoize}function throttle(func,wait,options){var timeout,context,args,result,previous=0;options||(options={});var later=function(){previous=options.leading===!1?0:now(),timeout=null,result=func.apply(context,args),timeout||(context=args=null)},throttled=function(){var _now=now();previous||options.leading!==!1||(previous=_now);var remaining=wait-(_now-previous);return context=this,args=arguments,0>=remaining||remaining>wait?(timeout&&(clearTimeout(timeout),timeout=null),previous=_now,result=func.apply(context,args),timeout||(context=args=null)):timeout||options.trailing===!1||(timeout=setTimeout(later,remaining)),result};return throttled.cancel=function(){clearTimeout(timeout),previous=0,timeout=context=args=null},throttled}function debounce(func,wait,immediate){var timeout,previous,args,result,context,later=function(){var passed=now()-previous;wait>passed?timeout=setTimeout(later,wait-passed):(timeout=null,immediate||(result=func.apply(context,args)),timeout||(args=context=null))},debounced=restArguments(function(_args){return context=this,args=_args,previous=now(),timeout||(timeout=setTimeout(later,wait),immediate&&(result=func.apply(context,args))),result});return debounced.cancel=function(){clearTimeout(timeout),timeout=args=context=null},debounced}function wrap(func,wrapper){return partial(wrapper,func)}function negate(predicate){return function(){return!predicate.apply(this,arguments)}}function compose(){var args=arguments,start=args.length-1;return function(){for(var i=start,result=args[start].apply(this,arguments);i--;)result=args[i].call(this,result);return result}}function after(times,func){return function(){return--times<1?func.apply(this,arguments):void 0}}function before(times,func){var memo;return function(){return--times>0&&(memo=func.apply(this,arguments)),1>=times&&(func=null),memo}}function findKey(obj,predicate,context){predicate=cb(predicate,context);for(var key,_keys=keys(obj),i=0,length=_keys.length;length>i;i++)if(key=_keys[i],predicate(obj[key],key,obj))return key}function createPredicateIndexFinder(dir){return function(array,predicate,context){predicate=cb(predicate,context);for(var length=getLength(array),index=dir>0?0:length-1;index>=0&&length>index;index+=dir)if(predicate(array[index],index,array))return index;return-1}}function sortedIndex(array,obj,iteratee,context){iteratee=cb(iteratee,context,1);for(var value=iteratee(obj),low=0,high=getLength(array);high>low;){var mid=Math.floor((low+high)/2);iteratee(array[mid])<value?low=mid+1:high=mid}return low}function createIndexFinder(dir,predicateFind,sortedIndex){return function(array,item,idx){var i=0,length=getLength(array);if("number"==typeof idx)dir>0?i=idx>=0?idx:Math.max(idx+length,i):length=idx>=0?Math.min(idx+1,length):idx+length+1;else if(sortedIndex&&idx&&length)return idx=sortedIndex(array,item),array[idx]===item?idx:-1;if(item!==item)return idx=predicateFind(slice.call(array,i,length),isNaN$1),idx>=0?idx+i:-1;for(idx=dir>0?i:length-1;idx>=0&&length>idx;idx+=dir)if(array[idx]===item)return idx;return-1}}function find(obj,predicate,context){var keyFinder=isArrayLike(obj)?findIndex:findKey,key=keyFinder(obj,predicate,context);return void 0!==key&&-1!==key?obj[key]:void 0}function findWhere(obj,attrs){return find(obj,matcher(attrs))}function each(obj,iteratee,context){iteratee=optimizeCb(iteratee,context);var i,length;if(isArrayLike(obj))for(i=0,length=obj.length;length>i;i++)iteratee(obj[i],i,obj);else{var _keys=keys(obj);for(i=0,length=_keys.length;length>i;i++)iteratee(obj[_keys[i]],_keys[i],obj)}return obj}function map(obj,iteratee,context){iteratee=cb(iteratee,context);for(var _keys=!isArrayLike(obj)&&keys(obj),length=(_keys||obj).length,results=Array(length),index=0;length>index;index++){var currentKey=_keys?_keys[index]:index;results[index]=iteratee(obj[currentKey],currentKey,obj)}return results}function createReduce(dir){var reducer=function(obj,iteratee,memo,initial){var _keys=!isArrayLike(obj)&&keys(obj),length=(_keys||obj).length,index=dir>0?0:length-1;for(initial||(memo=obj[_keys?_keys[index]:index],index+=dir);index>=0&&length>index;index+=dir){var currentKey=_keys?_keys[index]:index;memo=iteratee(memo,obj[currentKey],currentKey,obj)}return memo};return function(obj,iteratee,memo,context){var initial=arguments.length>=3;return reducer(obj,optimizeCb(iteratee,context,4),memo,initial)}}function filter(obj,predicate,context){var results=[];return predicate=cb(predicate,context),each(obj,function(value,index,list){predicate(value,index,list)&&results.push(value)}),results}function reject(obj,predicate,context){return filter(obj,negate(cb(predicate)),context)}function every(obj,predicate,context){predicate=cb(predicate,context);for(var _keys=!isArrayLike(obj)&&keys(obj),length=(_keys||obj).length,index=0;length>index;index++){var currentKey=_keys?_keys[index]:index;if(!predicate(obj[currentKey],currentKey,obj))return!1}return!0}function some(obj,predicate,context){predicate=cb(predicate,context);for(var _keys=!isArrayLike(obj)&&keys(obj),length=(_keys||obj).length,index=0;length>index;index++){var currentKey=_keys?_keys[index]:index;if(predicate(obj[currentKey],currentKey,obj))return!0}return!1}function contains(obj,item,fromIndex,guard){return isArrayLike(obj)||(obj=values(obj)),("number"!=typeof fromIndex||guard)&&(fromIndex=0),indexOf(obj,item,fromIndex)>=0}function pluck(obj,key){return map(obj,property(key))}function where(obj,attrs){return filter(obj,matcher(attrs))}function max(obj,iteratee,context){var value,computed,result=-(1/0),lastComputed=-(1/0);if(null==iteratee||"number"==typeof iteratee&&"object"!=typeof obj[0]&&null!=obj){obj=isArrayLike(obj)?obj:values(obj);for(var i=0,length=obj.length;length>i;i++)value=obj[i],null!=value&&value>result&&(result=value)}else iteratee=cb(iteratee,context),each(obj,function(v,index,list){computed=iteratee(v,index,list),(computed>lastComputed||computed===-(1/0)&&result===-(1/0))&&(result=v,lastComputed=computed)});return result}function min(obj,iteratee,context){var value,computed,result=1/0,lastComputed=1/0;if(null==iteratee||"number"==typeof iteratee&&"object"!=typeof obj[0]&&null!=obj){obj=isArrayLike(obj)?obj:values(obj);for(var i=0,length=obj.length;length>i;i++)value=obj[i],null!=value&&result>value&&(result=value)}else iteratee=cb(iteratee,context),each(obj,function(v,index,list){computed=iteratee(v,index,list),(lastComputed>computed||computed===1/0&&result===1/0)&&(result=v,lastComputed=computed)});return result}function sample(obj,n,guard){if(null==n||guard)return isArrayLike(obj)||(obj=values(obj)),obj[random(obj.length-1)];var sample=isArrayLike(obj)?clone(obj):values(obj),length=getLength(sample);n=Math.max(Math.min(n,length),0);for(var last=length-1,index=0;n>index;index++){var rand=random(index,last),temp=sample[index];sample[index]=sample[rand],sample[rand]=temp}return sample.slice(0,n)}function shuffle(obj){return sample(obj,1/0)}function sortBy(obj,iteratee,context){var index=0;return iteratee=cb(iteratee,context),pluck(map(obj,function(value,key,list){return{value:value,index:index++,criteria:iteratee(value,key,list)}}).sort(function(left,right){var a=left.criteria,b=right.criteria;if(a!==b){if(a>b||void 0===a)return 1;if(b>a||void 0===b)return-1}return left.index-right.index}),"value")}function group(behavior,partition){return function(obj,iteratee,context){var result=partition?[[],[]]:{};return iteratee=cb(iteratee,context),each(obj,function(value,index){var key=iteratee(value,index,obj);behavior(result,value,key)}),result}}function toArray(obj){return obj?isArray(obj)?slice.call(obj):isString(obj)?obj.match(reStrSymbol):isArrayLike(obj)?map(obj,identity):values(obj):[]}function size(obj){return null==obj?0:isArrayLike(obj)?obj.length:keys(obj).length}function keyInObj(value,key,obj){return key in obj}function initial(array,n,guard){return slice.call(array,0,Math.max(0,array.length-(null==n||guard?1:n)))}function first(array,n,guard){return null==array||array.length<1?null==n||guard?void 0:[]:null==n||guard?array[0]:initial(array,array.length-n)}function rest(array,n,guard){return slice.call(array,null==n||guard?1:n)}function last(array,n,guard){return null==array||array.length<1?null==n||guard?void 0:[]:null==n||guard?array[array.length-1]:rest(array,Math.max(0,array.length-n))}function compact(array){return filter(array,Boolean)}function flatten(array,depth){return flatten$1(array,depth,!1)}function uniq(array,isSorted,iteratee,context){isBoolean(isSorted)||(context=iteratee,iteratee=isSorted,isSorted=!1),null!=iteratee&&(iteratee=cb(iteratee,context));for(var result=[],seen=[],i=0,length=getLength(array);length>i;i++){var value=array[i],computed=iteratee?iteratee(value,i,array):value;isSorted&&!iteratee?(i&&seen===computed||result.push(value),seen=computed):iteratee?contains(seen,computed)||(seen.push(computed),result.push(value)):contains(result,value)||result.push(value)}return result}function intersection(array){for(var result=[],argsLength=arguments.length,i=0,length=getLength(array);length>i;i++){var item=array[i];if(!contains(result,item)){var j;for(j=1;argsLength>j&&contains(arguments[j],item);j++);j===argsLength&&result.push(item)}}return result}function unzip(array){for(var length=array&&max(array,getLength).length||0,result=Array(length),index=0;length>index;index++)result[index]=pluck(array,index);return result}function object(list,values){for(var result={},i=0,length=getLength(list);length>i;i++)values?result[list[i]]=values[i]:result[list[i][0]]=list[i][1];return result}function range(start,stop,step){null==stop&&(stop=start||0,start=0),step||(step=start>stop?-1:1);for(var length=Math.max(Math.ceil((stop-start)/step),0),range=Array(length),idx=0;length>idx;idx++,start+=step)range[idx]=start;return range}function chunk(array,count){if(null==count||1>count)return[];for(var result=[],i=0,length=array.length;length>i;)result.push(slice.call(array,i,i+=count));return result}function chainResult(instance,obj){return instance._chain?_$1(obj).chain():obj}function mixin(obj){return each(functions(obj),function(name){var func=_$1[name]=obj[name];_$1.prototype[name]=function(){var args=[this._wrapped];return push.apply(args,arguments),chainResult(this,func.apply(_$1,args))}}),_$1}var VERSION="1.13.1",root="object"==typeof self&&self.self===self&&self||"object"==typeof global&&global.global===global&&global||Function("return this")()||{},ArrayProto=Array.prototype,ObjProto=Object.prototype,SymbolProto="undefined"!=typeof Symbol?Symbol.prototype:null,push=ArrayProto.push,slice=ArrayProto.slice,toString=ObjProto.toString,hasOwnProperty=ObjProto.hasOwnProperty,supportsArrayBuffer="undefined"!=typeof ArrayBuffer,supportsDataView="undefined"!=typeof DataView,nativeIsArray=Array.isArray,nativeKeys=Object.keys,nativeCreate=Object.create,nativeIsView=supportsArrayBuffer&&ArrayBuffer.isView,_isNaN=isNaN,_isFinite=isFinite,hasEnumBug=!{toString:null}.propertyIsEnumerable("toString"),nonEnumerableProps=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],MAX_ARRAY_INDEX=Math.pow(2,53)-1,isString=tagTester("String"),isNumber=tagTester("Number"),isDate=tagTester("Date"),isRegExp=tagTester("RegExp"),isError=tagTester("Error"),isSymbol=tagTester("Symbol"),isArrayBuffer=tagTester("ArrayBuffer"),isFunction=tagTester("Function"),nodelist=root.document&&root.document.childNodes;"function"!=typeof/./&&"object"!=typeof Int8Array&&"function"!=typeof nodelist&&(isFunction=function(obj){return"function"==typeof obj||!1});var isFunction$1=isFunction,hasObjectTag=tagTester("Object"),hasStringTagBug=supportsDataView&&hasObjectTag(new DataView(new ArrayBuffer(8))),isIE11="undefined"!=typeof Map&&hasObjectTag(new Map),isDataView=tagTester("DataView"),isDataView$1=hasStringTagBug?ie10IsDataView:isDataView,isArray=nativeIsArray||tagTester("Array"),isArguments=tagTester("Arguments");!function(){isArguments(arguments)||(isArguments=function(obj){return has$1(obj,"callee")})}();var isArguments$1=isArguments,getByteLength=shallowProperty("byteLength"),isBufferLike=createSizePropertyCheck(getByteLength),typedArrayPattern=/\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/,isTypedArray$1=supportsArrayBuffer?isTypedArray:constant(!1),getLength=shallowProperty("length");_$1.VERSION=VERSION,_$1.prototype.value=function(){return this._wrapped},_$1.prototype.valueOf=_$1.prototype.toJSON=_$1.prototype.value,_$1.prototype.toString=function(){return String(this._wrapped)};var tagDataView="[object DataView]",forEachName="forEach",hasName="has",commonInit=["clear","delete"],mapTail=["get",hasName,"set"],mapMethods=commonInit.concat(forEachName,mapTail),weakMapMethods=commonInit.concat(mapTail),setMethods=["add"].concat(commonInit,forEachName,hasName),isMap=isIE11?ie11fingerprint(mapMethods):tagTester("Map"),isWeakMap=isIE11?ie11fingerprint(weakMapMethods):tagTester("WeakMap"),isSet=isIE11?ie11fingerprint(setMethods):tagTester("Set"),isWeakSet=tagTester("WeakSet"),extend=createAssigner(allKeys),extendOwn=createAssigner(keys),defaults=createAssigner(allKeys,!0);_$1.toPath=toPath$1,_$1.iteratee=iteratee;var now=Date.now||function(){return(new Date).getTime()},escapeMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},_escape=createEscaper(escapeMap),unescapeMap=invert(escapeMap),_unescape=createEscaper(unescapeMap),templateSettings=_$1.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g},noMatch=/(.)^/,escapes={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},escapeRegExp=/\\|'|\r|\n|\u2028|\u2029/g,bareIdentifier=/^\s*(\w|\$)+\s*$/,idCounter=0,partial=restArguments(function(func,boundArgs){var placeholder=partial.placeholder,bound=function(){for(var position=0,length=boundArgs.length,args=Array(length),i=0;length>i;i++)args[i]=boundArgs[i]===placeholder?arguments[position++]:boundArgs[i];for(;position<arguments.length;)args.push(arguments[position++]);return executeBound(func,bound,this,this,args)};return bound});partial.placeholder=_$1;var bind=restArguments(function(func,context,args){if(!isFunction$1(func))throw new TypeError("Bind must be called on a function");var bound=restArguments(function(callArgs){return executeBound(func,bound,context,this,args.concat(callArgs))});return bound}),isArrayLike=createSizePropertyCheck(getLength),bindAll=restArguments(function(obj,keys){keys=flatten$1(keys,!1,!1);var index=keys.length;if(1>index)throw new Error("bindAll must be passed function names");for(;index--;){var key=keys[index];obj[key]=bind(obj[key],obj)}return obj}),delay=restArguments(function(func,wait,args){return setTimeout(function(){return func.apply(null,args)},wait)}),defer=partial(delay,_$1,1),once=partial(before,2),findIndex=createPredicateIndexFinder(1),findLastIndex=createPredicateIndexFinder(-1),indexOf=createIndexFinder(1,findIndex,sortedIndex),lastIndexOf=createIndexFinder(-1,findLastIndex),reduce=createReduce(1),reduceRight=createReduce(-1),invoke=restArguments(function(obj,path,args){var contextPath,func;return isFunction$1(path)?func=path:(path=toPath(path),contextPath=path.slice(0,-1),path=path[path.length-1]),map(obj,function(context){var method=func;if(!method){if(contextPath&&contextPath.length&&(context=deepGet(context,contextPath)),null==context)return void 0;method=context[path]}return null==method?method:method.apply(context,args)})}),groupBy=group(function(result,value,key){has$1(result,key)?result[key].push(value):result[key]=[value]}),indexBy=group(function(result,value,key){result[key]=value}),countBy=group(function(result,value,key){has$1(result,key)?result[key]++:result[key]=1}),partition=group(function(result,value,pass){result[pass?0:1].push(value)},!0),reStrSymbol=/[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g,pick=restArguments(function(obj,keys){var result={},iteratee=keys[0];if(null==obj)return result;isFunction$1(iteratee)?(keys.length>1&&(iteratee=optimizeCb(iteratee,keys[1])),keys=allKeys(obj)):(iteratee=keyInObj,keys=flatten$1(keys,!1,!1),obj=Object(obj));for(var i=0,length=keys.length;length>i;i++){var key=keys[i],value=obj[key];iteratee(value,key,obj)&&(result[key]=value)}return result}),omit=restArguments(function(obj,keys){var context,iteratee=keys[0];return isFunction$1(iteratee)?(iteratee=negate(iteratee),keys.length>1&&(context=keys[1])):(keys=map(flatten$1(keys,!1,!1),String),iteratee=function(value,key){return!contains(keys,key)}),pick(obj,iteratee,context)}),difference=restArguments(function(array,rest){return rest=flatten$1(rest,!0,!0),filter(array,function(value){return!contains(rest,value)})}),without=restArguments(function(array,otherArrays){return difference(array,otherArrays)}),union=restArguments(function(arrays){return uniq(flatten$1(arrays,!0,!0))}),zip=restArguments(unzip);each(["pop","push","reverse","shift","sort","splice","unshift"],function(name){var method=ArrayProto[name];_$1.prototype[name]=function(){var obj=this._wrapped;return null!=obj&&(method.apply(obj,arguments),"shift"!==name&&"splice"!==name||0!==obj.length||delete obj[0]),chainResult(this,obj)}}),each(["concat","join","slice"],function(name){var method=ArrayProto[name];_$1.prototype[name]=function(){var obj=this._wrapped;return null!=obj&&(obj=method.apply(obj,arguments)),chainResult(this,obj)}});var allExports={__proto__:null,VERSION:VERSION,restArguments:restArguments,isObject:isObject,isNull:isNull,isUndefined:isUndefined,isBoolean:isBoolean,isElement:isElement,isString:isString,isNumber:isNumber,isDate:isDate,isRegExp:isRegExp,isError:isError,isSymbol:isSymbol,isArrayBuffer:isArrayBuffer,isDataView:isDataView$1,isArray:isArray,isFunction:isFunction$1,isArguments:isArguments$1,isFinite:isFinite$1,isNaN:isNaN$1,isTypedArray:isTypedArray$1,isEmpty:isEmpty,isMatch:isMatch,isEqual:isEqual,isMap:isMap,isWeakMap:isWeakMap,isSet:isSet,isWeakSet:isWeakSet,keys:keys,allKeys:allKeys,values:values,pairs:pairs,invert:invert,functions:functions,methods:functions,extend:extend,extendOwn:extendOwn,assign:extendOwn,defaults:defaults,create:create,clone:clone,tap:tap,get:get,has:has,mapObject:mapObject,identity:identity,constant:constant,noop:noop,toPath:toPath$1,property:property,propertyOf:propertyOf,matcher:matcher,matches:matcher,times:times,random:random,now:now,escape:_escape,unescape:_unescape,templateSettings:templateSettings,template:template,result:result,uniqueId:uniqueId,chain:chain,iteratee:iteratee,partial:partial,bind:bind,bindAll:bindAll,memoize:memoize,delay:delay,defer:defer,throttle:throttle,debounce:debounce,wrap:wrap,negate:negate,compose:compose,after:after,before:before,once:once,findKey:findKey,findIndex:findIndex,findLastIndex:findLastIndex,sortedIndex:sortedIndex,indexOf:indexOf,lastIndexOf:lastIndexOf,find:find,detect:find,findWhere:findWhere,each:each,forEach:each,map:map,collect:map,reduce:reduce,foldl:reduce,inject:reduce,reduceRight:reduceRight,foldr:reduceRight,filter:filter,select:filter,reject:reject,every:every,all:every,some:some,any:some,contains:contains,includes:contains,include:contains,invoke:invoke,pluck:pluck,where:where,max:max,min:min,shuffle:shuffle,sample:sample,sortBy:sortBy,groupBy:groupBy,indexBy:indexBy,countBy:countBy,partition:partition,toArray:toArray,size:size,pick:pick,omit:omit,first:first,head:first,take:first,initial:initial,last:last,rest:rest,tail:rest,drop:rest,compact:compact,flatten:flatten,without:without,uniq:uniq,unique:uniq,union:union,intersection:intersection,difference:difference,unzip:unzip,transpose:unzip,zip:zip,object:object,range:range,chunk:chunk,mixin:mixin,"default":_$1},_=mixin(allExports);return _._=_,_})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],68:[function(require,module,exports){(function(){var assign,getValue,isArray,isEmpty,isFunction,isObject,isPlainObject,slice=[].slice,hasProp={}.hasOwnProperty;assign=function(){var i,key,len,source,sources,target;if(target=arguments[0],sources=2<=arguments.length?slice.call(arguments,1):[],isFunction(Object.assign))Object.assign.apply(null,arguments);else for(i=0,len=sources.length;len>i;i++)if(source=sources[i],null!=source)for(key in source)hasProp.call(source,key)&&(target[key]=source[key]);return target},isFunction=function(val){return!!val&&"[object Function]"===Object.prototype.toString.call(val)},isObject=function(val){var ref;return!!val&&("function"==(ref=typeof val)||"object"===ref)},isArray=function(val){return isFunction(Array.isArray)?Array.isArray(val):"[object Array]"===Object.prototype.toString.call(val)},isEmpty=function(val){var key;if(isArray(val))return!val.length;for(key in val)if(hasProp.call(val,key))return!1;return!0},isPlainObject=function(val){var ctor,proto;return isObject(val)&&(proto=Object.getPrototypeOf(val))&&(ctor=proto.constructor)&&"function"==typeof ctor&&ctor instanceof ctor&&Function.prototype.toString.call(ctor)===Function.prototype.toString.call(Object)},getValue=function(obj){return isFunction(obj.valueOf)?obj.valueOf():obj},module.exports.assign=assign,module.exports.isFunction=isFunction,module.exports.isObject=isObject,module.exports.isArray=isArray,module.exports.isEmpty=isEmpty,module.exports.isPlainObject=isPlainObject,module.exports.getValue=getValue}).call(this)},{}],69:[function(require,module,exports){(function(){var XMLAttribute;module.exports=XMLAttribute=function(){function XMLAttribute(parent,name,value){if(this.options=parent.options,this.stringify=parent.stringify,this.parent=parent,null==name)throw new Error("Missing attribute name. "+this.debugInfo(name));if(null==value)throw new Error("Missing attribute value. "+this.debugInfo(name));this.name=this.stringify.attName(name),this.value=this.stringify.attValue(value)}return XMLAttribute.prototype.clone=function(){return Object.create(this)},XMLAttribute.prototype.toString=function(options){return this.options.writer.set(options).attribute(this)},XMLAttribute.prototype.debugInfo=function(name){var ref,ref1;return name=name||this.name,null!=name||(null!=(ref=this.parent)?ref.name:void 0)?null==name?"parent: <"+this.parent.name+">":(null!=(ref1=this.parent)?ref1.name:void 0)?"attribute: {"+name+"}, parent: <"+this.parent.name+">":"attribute: {"+name+"}":""},XMLAttribute}()}).call(this)},{}],70:[function(require,module,exports){(function(){var XMLCData,XMLNode,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLNode=require("./XMLNode"),module.exports=XMLCData=function(superClass){function XMLCData(parent,text){if(XMLCData.__super__.constructor.call(this,parent),null==text)throw new Error("Missing CDATA text. "+this.debugInfo());this.text=this.stringify.cdata(text)}return extend(XMLCData,superClass),XMLCData.prototype.clone=function(){return Object.create(this)},XMLCData.prototype.toString=function(options){return this.options.writer.set(options).cdata(this)},XMLCData}(XMLNode)}).call(this)},{"./XMLNode":81}],71:[function(require,module,exports){(function(){var XMLComment,XMLNode,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLNode=require("./XMLNode"),module.exports=XMLComment=function(superClass){function XMLComment(parent,text){if(XMLComment.__super__.constructor.call(this,parent),null==text)throw new Error("Missing comment text. "+this.debugInfo());this.text=this.stringify.comment(text)}return extend(XMLComment,superClass),XMLComment.prototype.clone=function(){return Object.create(this)},XMLComment.prototype.toString=function(options){return this.options.writer.set(options).comment(this)},XMLComment}(XMLNode)}).call(this)},{"./XMLNode":81}],72:[function(require,module,exports){(function(){var XMLDTDAttList,XMLNode,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLNode=require("./XMLNode"),module.exports=XMLDTDAttList=function(superClass){function XMLDTDAttList(parent,elementName,attributeName,attributeType,defaultValueType,defaultValue){if(XMLDTDAttList.__super__.constructor.call(this,parent),null==elementName)throw new Error("Missing DTD element name. "+this.debugInfo());if(null==attributeName)throw new Error("Missing DTD attribute name. "+this.debugInfo(elementName));if(!attributeType)throw new Error("Missing DTD attribute type. "+this.debugInfo(elementName));if(!defaultValueType)throw new Error("Missing DTD attribute default. "+this.debugInfo(elementName));if(0!==defaultValueType.indexOf("#")&&(defaultValueType="#"+defaultValueType),!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/))throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. "+this.debugInfo(elementName));if(defaultValue&&!defaultValueType.match(/^(#FIXED|#DEFAULT)$/))throw new Error("Default value only applies to #FIXED or #DEFAULT. "+this.debugInfo(elementName));this.elementName=this.stringify.eleName(elementName),this.attributeName=this.stringify.attName(attributeName),this.attributeType=this.stringify.dtdAttType(attributeType),this.defaultValue=this.stringify.dtdAttDefault(defaultValue),this.defaultValueType=defaultValueType}return extend(XMLDTDAttList,superClass),XMLDTDAttList.prototype.toString=function(options){return this.options.writer.set(options).dtdAttList(this)},XMLDTDAttList}(XMLNode)}).call(this)},{"./XMLNode":81}],73:[function(require,module,exports){(function(){var XMLDTDElement,XMLNode,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLNode=require("./XMLNode"),module.exports=XMLDTDElement=function(superClass){function XMLDTDElement(parent,name,value){if(XMLDTDElement.__super__.constructor.call(this,parent),null==name)throw new Error("Missing DTD element name. "+this.debugInfo());value||(value="(#PCDATA)"),Array.isArray(value)&&(value="("+value.join(",")+")"),this.name=this.stringify.eleName(name),this.value=this.stringify.dtdElementValue(value)}return extend(XMLDTDElement,superClass),XMLDTDElement.prototype.toString=function(options){return this.options.writer.set(options).dtdElement(this)},XMLDTDElement}(XMLNode)}).call(this)},{"./XMLNode":81}],74:[function(require,module,exports){(function(){var XMLDTDEntity,XMLNode,isObject,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;isObject=require("./Utility").isObject,XMLNode=require("./XMLNode"),module.exports=XMLDTDEntity=function(superClass){function XMLDTDEntity(parent,pe,name,value){if(XMLDTDEntity.__super__.constructor.call(this,parent),null==name)throw new Error("Missing DTD entity name. "+this.debugInfo(name));if(null==value)throw new Error("Missing DTD entity value. "+this.debugInfo(name));if(this.pe=!!pe,this.name=this.stringify.eleName(name),isObject(value)){if(!value.pubID&&!value.sysID)throw new Error("Public and/or system identifiers are required for an external entity. "+this.debugInfo(name));if(value.pubID&&!value.sysID)throw new Error("System identifier is required for a public external entity. "+this.debugInfo(name));if(null!=value.pubID&&(this.pubID=this.stringify.dtdPubID(value.pubID)),null!=value.sysID&&(this.sysID=this.stringify.dtdSysID(value.sysID)),null!=value.nData&&(this.nData=this.stringify.dtdNData(value.nData)),this.pe&&this.nData)throw new Error("Notation declaration is not allowed in a parameter entity. "+this.debugInfo(name))}else this.value=this.stringify.dtdEntityValue(value)}return extend(XMLDTDEntity,superClass),XMLDTDEntity.prototype.toString=function(options){return this.options.writer.set(options).dtdEntity(this)},XMLDTDEntity}(XMLNode)}).call(this)},{"./Utility":68,"./XMLNode":81}],75:[function(require,module,exports){(function(){var XMLDTDNotation,XMLNode,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLNode=require("./XMLNode"),module.exports=XMLDTDNotation=function(superClass){function XMLDTDNotation(parent,name,value){if(XMLDTDNotation.__super__.constructor.call(this,parent),null==name)throw new Error("Missing DTD notation name. "+this.debugInfo(name));if(!value.pubID&&!value.sysID)throw new Error("Public or system identifiers are required for an external entity. "+this.debugInfo(name));this.name=this.stringify.eleName(name),null!=value.pubID&&(this.pubID=this.stringify.dtdPubID(value.pubID)),null!=value.sysID&&(this.sysID=this.stringify.dtdSysID(value.sysID))}return extend(XMLDTDNotation,superClass),XMLDTDNotation.prototype.toString=function(options){return this.options.writer.set(options).dtdNotation(this)},XMLDTDNotation}(XMLNode)}).call(this)},{"./XMLNode":81}],76:[function(require,module,exports){(function(){var XMLDeclaration,XMLNode,isObject,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;isObject=require("./Utility").isObject,XMLNode=require("./XMLNode"),module.exports=XMLDeclaration=function(superClass){function XMLDeclaration(parent,version,encoding,standalone){var ref;XMLDeclaration.__super__.constructor.call(this,parent),isObject(version)&&(ref=version,version=ref.version,encoding=ref.encoding,standalone=ref.standalone),version||(version="1.0"),this.version=this.stringify.xmlVersion(version),null!=encoding&&(this.encoding=this.stringify.xmlEncoding(encoding)),null!=standalone&&(this.standalone=this.stringify.xmlStandalone(standalone))}return extend(XMLDeclaration,superClass),XMLDeclaration.prototype.toString=function(options){return this.options.writer.set(options).declaration(this)},XMLDeclaration}(XMLNode)}).call(this)},{"./Utility":68,"./XMLNode":81}],77:[function(require,module,exports){(function(){var XMLDTDAttList,XMLDTDElement,XMLDTDEntity,XMLDTDNotation,XMLDocType,XMLNode,isObject,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;isObject=require("./Utility").isObject,XMLNode=require("./XMLNode"),XMLDTDAttList=require("./XMLDTDAttList"),XMLDTDEntity=require("./XMLDTDEntity"),XMLDTDElement=require("./XMLDTDElement"),XMLDTDNotation=require("./XMLDTDNotation"),module.exports=XMLDocType=function(superClass){function XMLDocType(parent,pubID,sysID){var ref,ref1;XMLDocType.__super__.constructor.call(this,parent),
this.name="!DOCTYPE",this.documentObject=parent,isObject(pubID)&&(ref=pubID,pubID=ref.pubID,sysID=ref.sysID),null==sysID&&(ref1=[pubID,sysID],sysID=ref1[0],pubID=ref1[1]),null!=pubID&&(this.pubID=this.stringify.dtdPubID(pubID)),null!=sysID&&(this.sysID=this.stringify.dtdSysID(sysID))}return extend(XMLDocType,superClass),XMLDocType.prototype.element=function(name,value){var child;return child=new XMLDTDElement(this,name,value),this.children.push(child),this},XMLDocType.prototype.attList=function(elementName,attributeName,attributeType,defaultValueType,defaultValue){var child;return child=new XMLDTDAttList(this,elementName,attributeName,attributeType,defaultValueType,defaultValue),this.children.push(child),this},XMLDocType.prototype.entity=function(name,value){var child;return child=new XMLDTDEntity(this,!1,name,value),this.children.push(child),this},XMLDocType.prototype.pEntity=function(name,value){var child;return child=new XMLDTDEntity(this,!0,name,value),this.children.push(child),this},XMLDocType.prototype.notation=function(name,value){var child;return child=new XMLDTDNotation(this,name,value),this.children.push(child),this},XMLDocType.prototype.toString=function(options){return this.options.writer.set(options).docType(this)},XMLDocType.prototype.ele=function(name,value){return this.element(name,value)},XMLDocType.prototype.att=function(elementName,attributeName,attributeType,defaultValueType,defaultValue){return this.attList(elementName,attributeName,attributeType,defaultValueType,defaultValue)},XMLDocType.prototype.ent=function(name,value){return this.entity(name,value)},XMLDocType.prototype.pent=function(name,value){return this.pEntity(name,value)},XMLDocType.prototype.not=function(name,value){return this.notation(name,value)},XMLDocType.prototype.up=function(){return this.root()||this.documentObject},XMLDocType}(XMLNode)}).call(this)},{"./Utility":68,"./XMLDTDAttList":72,"./XMLDTDElement":73,"./XMLDTDEntity":74,"./XMLDTDNotation":75,"./XMLNode":81}],78:[function(require,module,exports){(function(){var XMLDocument,XMLNode,XMLStringWriter,XMLStringifier,isPlainObject,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;isPlainObject=require("./Utility").isPlainObject,XMLNode=require("./XMLNode"),XMLStringifier=require("./XMLStringifier"),XMLStringWriter=require("./XMLStringWriter"),module.exports=XMLDocument=function(superClass){function XMLDocument(options){XMLDocument.__super__.constructor.call(this,null),this.name="?xml",options||(options={}),options.writer||(options.writer=new XMLStringWriter),this.options=options,this.stringify=new XMLStringifier(options),this.isDocument=!0}return extend(XMLDocument,superClass),XMLDocument.prototype.end=function(writer){var writerOptions;return writer?isPlainObject(writer)&&(writerOptions=writer,writer=this.options.writer.set(writerOptions)):writer=this.options.writer,writer.document(this)},XMLDocument.prototype.toString=function(options){return this.options.writer.set(options).document(this)},XMLDocument}(XMLNode)}).call(this)},{"./Utility":68,"./XMLNode":81,"./XMLStringWriter":85,"./XMLStringifier":86}],79:[function(require,module,exports){(function(){var XMLAttribute,XMLCData,XMLComment,XMLDTDAttList,XMLDTDElement,XMLDTDEntity,XMLDTDNotation,XMLDeclaration,XMLDocType,XMLDocumentCB,XMLElement,XMLProcessingInstruction,XMLRaw,XMLStringWriter,XMLStringifier,XMLText,getValue,isFunction,isObject,isPlainObject,ref,hasProp={}.hasOwnProperty;ref=require("./Utility"),isObject=ref.isObject,isFunction=ref.isFunction,isPlainObject=ref.isPlainObject,getValue=ref.getValue,XMLElement=require("./XMLElement"),XMLCData=require("./XMLCData"),XMLComment=require("./XMLComment"),XMLRaw=require("./XMLRaw"),XMLText=require("./XMLText"),XMLProcessingInstruction=require("./XMLProcessingInstruction"),XMLDeclaration=require("./XMLDeclaration"),XMLDocType=require("./XMLDocType"),XMLDTDAttList=require("./XMLDTDAttList"),XMLDTDEntity=require("./XMLDTDEntity"),XMLDTDElement=require("./XMLDTDElement"),XMLDTDNotation=require("./XMLDTDNotation"),XMLAttribute=require("./XMLAttribute"),XMLStringifier=require("./XMLStringifier"),XMLStringWriter=require("./XMLStringWriter"),module.exports=XMLDocumentCB=function(){function XMLDocumentCB(options,onData,onEnd){var writerOptions;this.name="?xml",options||(options={}),options.writer?isPlainObject(options.writer)&&(writerOptions=options.writer,options.writer=new XMLStringWriter(writerOptions)):options.writer=new XMLStringWriter(options),this.options=options,this.writer=options.writer,this.stringify=new XMLStringifier(options),this.onDataCallback=onData||function(){},this.onEndCallback=onEnd||function(){},this.currentNode=null,this.currentLevel=-1,this.openTags={},this.documentStarted=!1,this.documentCompleted=!1,this.root=null}return XMLDocumentCB.prototype.node=function(name,attributes,text){var ref1;if(null==name)throw new Error("Missing node name.");if(this.root&&-1===this.currentLevel)throw new Error("Document can only have one root node. "+this.debugInfo(name));return this.openCurrent(),name=getValue(name),null==attributes&&(attributes={}),attributes=getValue(attributes),isObject(attributes)||(ref1=[attributes,text],text=ref1[0],attributes=ref1[1]),this.currentNode=new XMLElement(this,name,attributes),this.currentNode.children=!1,this.currentLevel++,this.openTags[this.currentLevel]=this.currentNode,null!=text&&this.text(text),this},XMLDocumentCB.prototype.element=function(name,attributes,text){return this.currentNode&&this.currentNode instanceof XMLDocType?this.dtdElement.apply(this,arguments):this.node(name,attributes,text)},XMLDocumentCB.prototype.attribute=function(name,value){var attName,attValue;if(!this.currentNode||this.currentNode.children)throw new Error("att() can only be used immediately after an ele() call in callback mode. "+this.debugInfo(name));if(null!=name&&(name=getValue(name)),isObject(name))for(attName in name)hasProp.call(name,attName)&&(attValue=name[attName],this.attribute(attName,attValue));else isFunction(value)&&(value=value.apply()),this.options.skipNullAttributes&&null==value||(this.currentNode.attributes[name]=new XMLAttribute(this,name,value));return this},XMLDocumentCB.prototype.text=function(value){var node;return this.openCurrent(),node=new XMLText(this,value),this.onData(this.writer.text(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.cdata=function(value){var node;return this.openCurrent(),node=new XMLCData(this,value),this.onData(this.writer.cdata(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.comment=function(value){var node;return this.openCurrent(),node=new XMLComment(this,value),this.onData(this.writer.comment(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.raw=function(value){var node;return this.openCurrent(),node=new XMLRaw(this,value),this.onData(this.writer.raw(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.instruction=function(target,value){var i,insTarget,insValue,len,node;if(this.openCurrent(),null!=target&&(target=getValue(target)),null!=value&&(value=getValue(value)),Array.isArray(target))for(i=0,len=target.length;len>i;i++)insTarget=target[i],this.instruction(insTarget);else if(isObject(target))for(insTarget in target)hasProp.call(target,insTarget)&&(insValue=target[insTarget],this.instruction(insTarget,insValue));else isFunction(value)&&(value=value.apply()),node=new XMLProcessingInstruction(this,target,value),this.onData(this.writer.processingInstruction(node,this.currentLevel+1),this.currentLevel+1);return this},XMLDocumentCB.prototype.declaration=function(version,encoding,standalone){var node;if(this.openCurrent(),this.documentStarted)throw new Error("declaration() must be the first node.");return node=new XMLDeclaration(this,version,encoding,standalone),this.onData(this.writer.declaration(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.doctype=function(root,pubID,sysID){if(this.openCurrent(),null==root)throw new Error("Missing root node name.");if(this.root)throw new Error("dtd() must come before the root node.");return this.currentNode=new XMLDocType(this,pubID,sysID),this.currentNode.rootNodeName=root,this.currentNode.children=!1,this.currentLevel++,this.openTags[this.currentLevel]=this.currentNode,this},XMLDocumentCB.prototype.dtdElement=function(name,value){var node;return this.openCurrent(),node=new XMLDTDElement(this,name,value),this.onData(this.writer.dtdElement(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.attList=function(elementName,attributeName,attributeType,defaultValueType,defaultValue){var node;return this.openCurrent(),node=new XMLDTDAttList(this,elementName,attributeName,attributeType,defaultValueType,defaultValue),this.onData(this.writer.dtdAttList(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.entity=function(name,value){var node;return this.openCurrent(),node=new XMLDTDEntity(this,!1,name,value),this.onData(this.writer.dtdEntity(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.pEntity=function(name,value){var node;return this.openCurrent(),node=new XMLDTDEntity(this,!0,name,value),this.onData(this.writer.dtdEntity(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.notation=function(name,value){var node;return this.openCurrent(),node=new XMLDTDNotation(this,name,value),this.onData(this.writer.dtdNotation(node,this.currentLevel+1),this.currentLevel+1),this},XMLDocumentCB.prototype.up=function(){if(this.currentLevel<0)throw new Error("The document node has no parent.");return this.currentNode?(this.currentNode.children?this.closeNode(this.currentNode):this.openNode(this.currentNode),this.currentNode=null):this.closeNode(this.openTags[this.currentLevel]),delete this.openTags[this.currentLevel],this.currentLevel--,this},XMLDocumentCB.prototype.end=function(){for(;this.currentLevel>=0;)this.up();return this.onEnd()},XMLDocumentCB.prototype.openCurrent=function(){return this.currentNode?(this.currentNode.children=!0,this.openNode(this.currentNode)):void 0},XMLDocumentCB.prototype.openNode=function(node){return node.isOpen?void 0:(!this.root&&0===this.currentLevel&&node instanceof XMLElement&&(this.root=node),this.onData(this.writer.openNode(node,this.currentLevel),this.currentLevel),node.isOpen=!0)},XMLDocumentCB.prototype.closeNode=function(node){return node.isClosed?void 0:(this.onData(this.writer.closeNode(node,this.currentLevel),this.currentLevel),node.isClosed=!0)},XMLDocumentCB.prototype.onData=function(chunk,level){return this.documentStarted=!0,this.onDataCallback(chunk,level+1)},XMLDocumentCB.prototype.onEnd=function(){return this.documentCompleted=!0,this.onEndCallback()},XMLDocumentCB.prototype.debugInfo=function(name){return null==name?"":"node: <"+name+">"},XMLDocumentCB.prototype.ele=function(){return this.element.apply(this,arguments)},XMLDocumentCB.prototype.nod=function(name,attributes,text){return this.node(name,attributes,text)},XMLDocumentCB.prototype.txt=function(value){return this.text(value)},XMLDocumentCB.prototype.dat=function(value){return this.cdata(value)},XMLDocumentCB.prototype.com=function(value){return this.comment(value)},XMLDocumentCB.prototype.ins=function(target,value){return this.instruction(target,value)},XMLDocumentCB.prototype.dec=function(version,encoding,standalone){return this.declaration(version,encoding,standalone)},XMLDocumentCB.prototype.dtd=function(root,pubID,sysID){return this.doctype(root,pubID,sysID)},XMLDocumentCB.prototype.e=function(name,attributes,text){return this.element(name,attributes,text)},XMLDocumentCB.prototype.n=function(name,attributes,text){return this.node(name,attributes,text)},XMLDocumentCB.prototype.t=function(value){return this.text(value)},XMLDocumentCB.prototype.d=function(value){return this.cdata(value)},XMLDocumentCB.prototype.c=function(value){return this.comment(value)},XMLDocumentCB.prototype.r=function(value){return this.raw(value)},XMLDocumentCB.prototype.i=function(target,value){return this.instruction(target,value)},XMLDocumentCB.prototype.att=function(){return this.currentNode&&this.currentNode instanceof XMLDocType?this.attList.apply(this,arguments):this.attribute.apply(this,arguments)},XMLDocumentCB.prototype.a=function(){return this.currentNode&&this.currentNode instanceof XMLDocType?this.attList.apply(this,arguments):this.attribute.apply(this,arguments)},XMLDocumentCB.prototype.ent=function(name,value){return this.entity(name,value)},XMLDocumentCB.prototype.pent=function(name,value){return this.pEntity(name,value)},XMLDocumentCB.prototype.not=function(name,value){return this.notation(name,value)},XMLDocumentCB}()}).call(this)},{"./Utility":68,"./XMLAttribute":69,"./XMLCData":70,"./XMLComment":71,"./XMLDTDAttList":72,"./XMLDTDElement":73,"./XMLDTDEntity":74,"./XMLDTDNotation":75,"./XMLDeclaration":76,"./XMLDocType":77,"./XMLElement":80,"./XMLProcessingInstruction":82,"./XMLRaw":83,"./XMLStringWriter":85,"./XMLStringifier":86,"./XMLText":87}],80:[function(require,module,exports){(function(){var XMLAttribute,XMLElement,XMLNode,getValue,isFunction,isObject,ref,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;ref=require("./Utility"),isObject=ref.isObject,isFunction=ref.isFunction,getValue=ref.getValue,XMLNode=require("./XMLNode"),XMLAttribute=require("./XMLAttribute"),module.exports=XMLElement=function(superClass){function XMLElement(parent,name,attributes){if(XMLElement.__super__.constructor.call(this,parent),null==name)throw new Error("Missing element name. "+this.debugInfo());this.name=this.stringify.eleName(name),this.attributes={},null!=attributes&&this.attribute(attributes),parent.isDocument&&(this.isRoot=!0,this.documentObject=parent,parent.rootObject=this)}return extend(XMLElement,superClass),XMLElement.prototype.clone=function(){var att,attName,clonedSelf,ref1;clonedSelf=Object.create(this),clonedSelf.isRoot&&(clonedSelf.documentObject=null),clonedSelf.attributes={},ref1=this.attributes;for(attName in ref1)hasProp.call(ref1,attName)&&(att=ref1[attName],clonedSelf.attributes[attName]=att.clone());return clonedSelf.children=[],this.children.forEach(function(child){var clonedChild;return clonedChild=child.clone(),clonedChild.parent=clonedSelf,clonedSelf.children.push(clonedChild)}),clonedSelf},XMLElement.prototype.attribute=function(name,value){var attName,attValue;if(null!=name&&(name=getValue(name)),isObject(name))for(attName in name)hasProp.call(name,attName)&&(attValue=name[attName],this.attribute(attName,attValue));else isFunction(value)&&(value=value.apply()),this.options.skipNullAttributes&&null==value||(this.attributes[name]=new XMLAttribute(this,name,value));return this},XMLElement.prototype.removeAttribute=function(name){var attName,i,len;if(null==name)throw new Error("Missing attribute name. "+this.debugInfo());if(name=getValue(name),Array.isArray(name))for(i=0,len=name.length;len>i;i++)attName=name[i],delete this.attributes[attName];else delete this.attributes[name];return this},XMLElement.prototype.toString=function(options){return this.options.writer.set(options).element(this)},XMLElement.prototype.att=function(name,value){return this.attribute(name,value)},XMLElement.prototype.a=function(name,value){return this.attribute(name,value)},XMLElement}(XMLNode)}).call(this)},{"./Utility":68,"./XMLAttribute":69,"./XMLNode":81}],81:[function(require,module,exports){(function(){var XMLCData,XMLComment,XMLDeclaration,XMLDocType,XMLElement,XMLNode,XMLProcessingInstruction,XMLRaw,XMLText,getValue,isEmpty,isFunction,isObject,ref,hasProp={}.hasOwnProperty;ref=require("./Utility"),isObject=ref.isObject,isFunction=ref.isFunction,isEmpty=ref.isEmpty,getValue=ref.getValue,XMLElement=null,XMLCData=null,XMLComment=null,XMLDeclaration=null,XMLDocType=null,XMLRaw=null,XMLText=null,XMLProcessingInstruction=null,module.exports=XMLNode=function(){function XMLNode(parent){this.parent=parent,this.parent&&(this.options=this.parent.options,this.stringify=this.parent.stringify),this.children=[],XMLElement||(XMLElement=require("./XMLElement"),XMLCData=require("./XMLCData"),XMLComment=require("./XMLComment"),XMLDeclaration=require("./XMLDeclaration"),XMLDocType=require("./XMLDocType"),XMLRaw=require("./XMLRaw"),XMLText=require("./XMLText"),XMLProcessingInstruction=require("./XMLProcessingInstruction"))}return XMLNode.prototype.element=function(name,attributes,text){var childNode,item,j,k,key,lastChild,len,len1,ref1,val;if(lastChild=null,null==attributes&&(attributes={}),attributes=getValue(attributes),isObject(attributes)||(ref1=[attributes,text],text=ref1[0],attributes=ref1[1]),null!=name&&(name=getValue(name)),Array.isArray(name))for(j=0,len=name.length;len>j;j++)item=name[j],lastChild=this.element(item);else if(isFunction(name))lastChild=this.element(name.apply());else if(isObject(name)){for(key in name)if(hasProp.call(name,key))if(val=name[key],isFunction(val)&&(val=val.apply()),isObject(val)&&isEmpty(val)&&(val=null),!this.options.ignoreDecorators&&this.stringify.convertAttKey&&0===key.indexOf(this.stringify.convertAttKey))lastChild=this.attribute(key.substr(this.stringify.convertAttKey.length),val);else if(!this.options.separateArrayItems&&Array.isArray(val))for(k=0,len1=val.length;len1>k;k++)item=val[k],childNode={},childNode[key]=item,lastChild=this.element(childNode);else isObject(val)?(lastChild=this.element(key),lastChild.element(val)):lastChild=this.element(key,val)}else lastChild=!this.options.ignoreDecorators&&this.stringify.convertTextKey&&0===name.indexOf(this.stringify.convertTextKey)?this.text(text):!this.options.ignoreDecorators&&this.stringify.convertCDataKey&&0===name.indexOf(this.stringify.convertCDataKey)?this.cdata(text):!this.options.ignoreDecorators&&this.stringify.convertCommentKey&&0===name.indexOf(this.stringify.convertCommentKey)?this.comment(text):!this.options.ignoreDecorators&&this.stringify.convertRawKey&&0===name.indexOf(this.stringify.convertRawKey)?this.raw(text):!this.options.ignoreDecorators&&this.stringify.convertPIKey&&0===name.indexOf(this.stringify.convertPIKey)?this.instruction(name.substr(this.stringify.convertPIKey.length),text):this.node(name,attributes,text);if(null==lastChild)throw new Error("Could not create any elements with: "+name+". "+this.debugInfo());return lastChild},XMLNode.prototype.insertBefore=function(name,attributes,text){var child,i,removed;if(this.isRoot)throw new Error("Cannot insert elements at root level. "+this.debugInfo(name));return i=this.parent.children.indexOf(this),removed=this.parent.children.splice(i),child=this.parent.element(name,attributes,text),Array.prototype.push.apply(this.parent.children,removed),child},XMLNode.prototype.insertAfter=function(name,attributes,text){var child,i,removed;if(this.isRoot)throw new Error("Cannot insert elements at root level. "+this.debugInfo(name));return i=this.parent.children.indexOf(this),removed=this.parent.children.splice(i+1),child=this.parent.element(name,attributes,text),Array.prototype.push.apply(this.parent.children,removed),child},XMLNode.prototype.remove=function(){var i,ref1;if(this.isRoot)throw new Error("Cannot remove the root element. "+this.debugInfo());return i=this.parent.children.indexOf(this),[].splice.apply(this.parent.children,[i,i-i+1].concat(ref1=[])),ref1,this.parent},XMLNode.prototype.node=function(name,attributes,text){var child,ref1;return null!=name&&(name=getValue(name)),attributes||(attributes={}),attributes=getValue(attributes),isObject(attributes)||(ref1=[attributes,text],text=ref1[0],attributes=ref1[1]),child=new XMLElement(this,name,attributes),null!=text&&child.text(text),this.children.push(child),child},XMLNode.prototype.text=function(value){var child;return child=new XMLText(this,value),this.children.push(child),this},XMLNode.prototype.cdata=function(value){var child;return child=new XMLCData(this,value),this.children.push(child),this},XMLNode.prototype.comment=function(value){var child;return child=new XMLComment(this,value),this.children.push(child),this},XMLNode.prototype.commentBefore=function(value){var child,i,removed;return i=this.parent.children.indexOf(this),removed=this.parent.children.splice(i),child=this.parent.comment(value),Array.prototype.push.apply(this.parent.children,removed),this},XMLNode.prototype.commentAfter=function(value){var child,i,removed;return i=this.parent.children.indexOf(this),removed=this.parent.children.splice(i+1),child=this.parent.comment(value),Array.prototype.push.apply(this.parent.children,removed),this},XMLNode.prototype.raw=function(value){var child;return child=new XMLRaw(this,value),this.children.push(child),this},XMLNode.prototype.instruction=function(target,value){var insTarget,insValue,instruction,j,len;if(null!=target&&(target=getValue(target)),null!=value&&(value=getValue(value)),Array.isArray(target))for(j=0,len=target.length;len>j;j++)insTarget=target[j],this.instruction(insTarget);else if(isObject(target))for(insTarget in target)hasProp.call(target,insTarget)&&(insValue=target[insTarget],this.instruction(insTarget,insValue));else isFunction(value)&&(value=value.apply()),instruction=new XMLProcessingInstruction(this,target,value),this.children.push(instruction);return this},XMLNode.prototype.instructionBefore=function(target,value){var child,i,removed;return i=this.parent.children.indexOf(this),removed=this.parent.children.splice(i),child=this.parent.instruction(target,value),Array.prototype.push.apply(this.parent.children,removed),this},XMLNode.prototype.instructionAfter=function(target,value){var child,i,removed;return i=this.parent.children.indexOf(this),removed=this.parent.children.splice(i+1),child=this.parent.instruction(target,value),Array.prototype.push.apply(this.parent.children,removed),this},XMLNode.prototype.declaration=function(version,encoding,standalone){var doc,xmldec;return doc=this.document(),xmldec=new XMLDeclaration(doc,version,encoding,standalone),doc.children[0]instanceof XMLDeclaration?doc.children[0]=xmldec:doc.children.unshift(xmldec),doc.root()||doc},XMLNode.prototype.doctype=function(pubID,sysID){var child,doc,doctype,i,j,k,len,len1,ref1,ref2;for(doc=this.document(),doctype=new XMLDocType(doc,pubID,sysID),ref1=doc.children,i=j=0,len=ref1.length;len>j;i=++j)if(child=ref1[i],child instanceof XMLDocType)return doc.children[i]=doctype,doctype;for(ref2=doc.children,i=k=0,len1=ref2.length;len1>k;i=++k)if(child=ref2[i],child.isRoot)return doc.children.splice(i,0,doctype),doctype;return doc.children.push(doctype),doctype},XMLNode.prototype.up=function(){if(this.isRoot)throw new Error("The root node has no parent. Use doc() if you need to get the document object.");return this.parent},XMLNode.prototype.root=function(){var node;for(node=this;node;){if(node.isDocument)return node.rootObject;if(node.isRoot)return node;node=node.parent}},XMLNode.prototype.document=function(){var node;for(node=this;node;){if(node.isDocument)return node;node=node.parent}},XMLNode.prototype.end=function(options){return this.document().end(options)},XMLNode.prototype.prev=function(){var i;if(i=this.parent.children.indexOf(this),1>i)throw new Error("Already at the first node. "+this.debugInfo());return this.parent.children[i-1]},XMLNode.prototype.next=function(){var i;if(i=this.parent.children.indexOf(this),-1===i||i===this.parent.children.length-1)throw new Error("Already at the last node. "+this.debugInfo());return this.parent.children[i+1]},XMLNode.prototype.importDocument=function(doc){var clonedRoot;return clonedRoot=doc.root().clone(),clonedRoot.parent=this,clonedRoot.isRoot=!1,this.children.push(clonedRoot),this},XMLNode.prototype.debugInfo=function(name){var ref1,ref2;return name=name||this.name,null!=name||(null!=(ref1=this.parent)?ref1.name:void 0)?null==name?"parent: <"+this.parent.name+">":(null!=(ref2=this.parent)?ref2.name:void 0)?"node: <"+name+">, parent: <"+this.parent.name+">":"node: <"+name+">":""},XMLNode.prototype.ele=function(name,attributes,text){return this.element(name,attributes,text)},XMLNode.prototype.nod=function(name,attributes,text){return this.node(name,attributes,text)},XMLNode.prototype.txt=function(value){return this.text(value)},XMLNode.prototype.dat=function(value){return this.cdata(value)},XMLNode.prototype.com=function(value){return this.comment(value)},XMLNode.prototype.ins=function(target,value){return this.instruction(target,value)},XMLNode.prototype.doc=function(){return this.document()},XMLNode.prototype.dec=function(version,encoding,standalone){return this.declaration(version,encoding,standalone)},XMLNode.prototype.dtd=function(pubID,sysID){return this.doctype(pubID,sysID)},XMLNode.prototype.e=function(name,attributes,text){return this.element(name,attributes,text)},XMLNode.prototype.n=function(name,attributes,text){return this.node(name,attributes,text)},XMLNode.prototype.t=function(value){return this.text(value)},XMLNode.prototype.d=function(value){return this.cdata(value)},XMLNode.prototype.c=function(value){return this.comment(value)},XMLNode.prototype.r=function(value){return this.raw(value)},XMLNode.prototype.i=function(target,value){return this.instruction(target,value)},XMLNode.prototype.u=function(){return this.up()},XMLNode.prototype.importXMLBuilder=function(doc){return this.importDocument(doc)},XMLNode}()}).call(this)},{"./Utility":68,"./XMLCData":70,"./XMLComment":71,"./XMLDeclaration":76,"./XMLDocType":77,"./XMLElement":80,"./XMLProcessingInstruction":82,"./XMLRaw":83,"./XMLText":87}],82:[function(require,module,exports){(function(){var XMLNode,XMLProcessingInstruction,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLNode=require("./XMLNode"),module.exports=XMLProcessingInstruction=function(superClass){function XMLProcessingInstruction(parent,target,value){if(XMLProcessingInstruction.__super__.constructor.call(this,parent),null==target)throw new Error("Missing instruction target. "+this.debugInfo());this.target=this.stringify.insTarget(target),value&&(this.value=this.stringify.insValue(value))}return extend(XMLProcessingInstruction,superClass),XMLProcessingInstruction.prototype.clone=function(){return Object.create(this)},XMLProcessingInstruction.prototype.toString=function(options){return this.options.writer.set(options).processingInstruction(this)},XMLProcessingInstruction}(XMLNode)}).call(this)},{"./XMLNode":81}],83:[function(require,module,exports){(function(){var XMLNode,XMLRaw,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLNode=require("./XMLNode"),module.exports=XMLRaw=function(superClass){function XMLRaw(parent,text){if(XMLRaw.__super__.constructor.call(this,parent),null==text)throw new Error("Missing raw text. "+this.debugInfo());this.value=this.stringify.raw(text)}return extend(XMLRaw,superClass),XMLRaw.prototype.clone=function(){return Object.create(this)},XMLRaw.prototype.toString=function(options){return this.options.writer.set(options).raw(this)},XMLRaw}(XMLNode)}).call(this)},{"./XMLNode":81}],84:[function(require,module,exports){(function(){var XMLCData,XMLComment,XMLDTDAttList,XMLDTDElement,XMLDTDEntity,XMLDTDNotation,XMLDeclaration,XMLDocType,XMLElement,XMLProcessingInstruction,XMLRaw,XMLStreamWriter,XMLText,XMLWriterBase,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLDeclaration=require("./XMLDeclaration"),XMLDocType=require("./XMLDocType"),XMLCData=require("./XMLCData"),XMLComment=require("./XMLComment"),XMLElement=require("./XMLElement"),XMLRaw=require("./XMLRaw"),XMLText=require("./XMLText"),XMLProcessingInstruction=require("./XMLProcessingInstruction"),XMLDTDAttList=require("./XMLDTDAttList"),XMLDTDElement=require("./XMLDTDElement"),XMLDTDEntity=require("./XMLDTDEntity"),XMLDTDNotation=require("./XMLDTDNotation"),XMLWriterBase=require("./XMLWriterBase"),module.exports=XMLStreamWriter=function(superClass){function XMLStreamWriter(stream,options){XMLStreamWriter.__super__.constructor.call(this,options),this.stream=stream}return extend(XMLStreamWriter,superClass),XMLStreamWriter.prototype.document=function(doc){var child,i,j,len,len1,ref,ref1,results;for(ref=doc.children,i=0,len=ref.length;len>i;i++)child=ref[i],child.isLastRootNode=!1;for(doc.children[doc.children.length-1].isLastRootNode=!0,ref1=doc.children,results=[],j=0,len1=ref1.length;len1>j;j++)switch(child=ref1[j],!1){case!(child instanceof XMLDeclaration):results.push(this.declaration(child));break;case!(child instanceof XMLDocType):results.push(this.docType(child));break;case!(child instanceof XMLComment):results.push(this.comment(child));break;case!(child instanceof XMLProcessingInstruction):results.push(this.processingInstruction(child));break;default:results.push(this.element(child))}return results},XMLStreamWriter.prototype.attribute=function(att){return this.stream.write(" "+att.name+'="'+att.value+'"')},XMLStreamWriter.prototype.cdata=function(node,level){return this.stream.write(this.space(level)+"<![CDATA["+node.text+"]]>"+this.endline(node))},XMLStreamWriter.prototype.comment=function(node,level){return this.stream.write(this.space(level)+"<!-- "+node.text+" -->"+this.endline(node))},XMLStreamWriter.prototype.declaration=function(node,level){return this.stream.write(this.space(level)),this.stream.write('<?xml version="'+node.version+'"'),null!=node.encoding&&this.stream.write(' encoding="'+node.encoding+'"'),null!=node.standalone&&this.stream.write(' standalone="'+node.standalone+'"'),this.stream.write(this.spacebeforeslash+"?>"),this.stream.write(this.endline(node))},XMLStreamWriter.prototype.docType=function(node,level){var child,i,len,ref;if(level||(level=0),this.stream.write(this.space(level)),this.stream.write("<!DOCTYPE "+node.root().name),node.pubID&&node.sysID?this.stream.write(' PUBLIC "'+node.pubID+'" "'+node.sysID+'"'):node.sysID&&this.stream.write(' SYSTEM "'+node.sysID+'"'),node.children.length>0){for(this.stream.write(" ["),this.stream.write(this.endline(node)),ref=node.children,i=0,len=ref.length;len>i;i++)switch(child=ref[i],!1){case!(child instanceof XMLDTDAttList):this.dtdAttList(child,level+1);break;case!(child instanceof XMLDTDElement):this.dtdElement(child,level+1);break;case!(child instanceof XMLDTDEntity):this.dtdEntity(child,level+1);break;case!(child instanceof XMLDTDNotation):this.dtdNotation(child,level+1);break;case!(child instanceof XMLCData):this.cdata(child,level+1);break;case!(child instanceof XMLComment):this.comment(child,level+1);break;case!(child instanceof XMLProcessingInstruction):this.processingInstruction(child,level+1);break;default:throw new Error("Unknown DTD node type: "+child.constructor.name)}this.stream.write("]")}return this.stream.write(this.spacebeforeslash+">"),this.stream.write(this.endline(node))},XMLStreamWriter.prototype.element=function(node,level){var att,child,i,len,name,ref,ref1,space;level||(level=0),space=this.space(level),this.stream.write(space+"<"+node.name),ref=node.attributes;for(name in ref)hasProp.call(ref,name)&&(att=ref[name],
this.attribute(att));if(0===node.children.length||node.children.every(function(e){return""===e.value}))this.allowEmpty?this.stream.write("></"+node.name+">"):this.stream.write(this.spacebeforeslash+"/>");else if(this.pretty&&1===node.children.length&&null!=node.children[0].value)this.stream.write(">"),this.stream.write(node.children[0].value),this.stream.write("</"+node.name+">");else{for(this.stream.write(">"+this.newline),ref1=node.children,i=0,len=ref1.length;len>i;i++)switch(child=ref1[i],!1){case!(child instanceof XMLCData):this.cdata(child,level+1);break;case!(child instanceof XMLComment):this.comment(child,level+1);break;case!(child instanceof XMLElement):this.element(child,level+1);break;case!(child instanceof XMLRaw):this.raw(child,level+1);break;case!(child instanceof XMLText):this.text(child,level+1);break;case!(child instanceof XMLProcessingInstruction):this.processingInstruction(child,level+1);break;default:throw new Error("Unknown XML node type: "+child.constructor.name)}this.stream.write(space+"</"+node.name+">")}return this.stream.write(this.endline(node))},XMLStreamWriter.prototype.processingInstruction=function(node,level){return this.stream.write(this.space(level)+"<?"+node.target),node.value&&this.stream.write(" "+node.value),this.stream.write(this.spacebeforeslash+"?>"+this.endline(node))},XMLStreamWriter.prototype.raw=function(node,level){return this.stream.write(this.space(level)+node.value+this.endline(node))},XMLStreamWriter.prototype.text=function(node,level){return this.stream.write(this.space(level)+node.value+this.endline(node))},XMLStreamWriter.prototype.dtdAttList=function(node,level){return this.stream.write(this.space(level)+"<!ATTLIST "+node.elementName+" "+node.attributeName+" "+node.attributeType),"#DEFAULT"!==node.defaultValueType&&this.stream.write(" "+node.defaultValueType),node.defaultValue&&this.stream.write(' "'+node.defaultValue+'"'),this.stream.write(this.spacebeforeslash+">"+this.endline(node))},XMLStreamWriter.prototype.dtdElement=function(node,level){return this.stream.write(this.space(level)+"<!ELEMENT "+node.name+" "+node.value),this.stream.write(this.spacebeforeslash+">"+this.endline(node))},XMLStreamWriter.prototype.dtdEntity=function(node,level){return this.stream.write(this.space(level)+"<!ENTITY"),node.pe&&this.stream.write(" %"),this.stream.write(" "+node.name),node.value?this.stream.write(' "'+node.value+'"'):(node.pubID&&node.sysID?this.stream.write(' PUBLIC "'+node.pubID+'" "'+node.sysID+'"'):node.sysID&&this.stream.write(' SYSTEM "'+node.sysID+'"'),node.nData&&this.stream.write(" NDATA "+node.nData)),this.stream.write(this.spacebeforeslash+">"+this.endline(node))},XMLStreamWriter.prototype.dtdNotation=function(node,level){return this.stream.write(this.space(level)+"<!NOTATION "+node.name),node.pubID&&node.sysID?this.stream.write(' PUBLIC "'+node.pubID+'" "'+node.sysID+'"'):node.pubID?this.stream.write(' PUBLIC "'+node.pubID+'"'):node.sysID&&this.stream.write(' SYSTEM "'+node.sysID+'"'),this.stream.write(this.spacebeforeslash+">"+this.endline(node))},XMLStreamWriter.prototype.endline=function(node){return node.isLastRootNode?"":this.newline},XMLStreamWriter}(XMLWriterBase)}).call(this)},{"./XMLCData":70,"./XMLComment":71,"./XMLDTDAttList":72,"./XMLDTDElement":73,"./XMLDTDEntity":74,"./XMLDTDNotation":75,"./XMLDeclaration":76,"./XMLDocType":77,"./XMLElement":80,"./XMLProcessingInstruction":82,"./XMLRaw":83,"./XMLText":87,"./XMLWriterBase":88}],85:[function(require,module,exports){(function(){var XMLCData,XMLComment,XMLDTDAttList,XMLDTDElement,XMLDTDEntity,XMLDTDNotation,XMLDeclaration,XMLDocType,XMLElement,XMLProcessingInstruction,XMLRaw,XMLStringWriter,XMLText,XMLWriterBase,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLDeclaration=require("./XMLDeclaration"),XMLDocType=require("./XMLDocType"),XMLCData=require("./XMLCData"),XMLComment=require("./XMLComment"),XMLElement=require("./XMLElement"),XMLRaw=require("./XMLRaw"),XMLText=require("./XMLText"),XMLProcessingInstruction=require("./XMLProcessingInstruction"),XMLDTDAttList=require("./XMLDTDAttList"),XMLDTDElement=require("./XMLDTDElement"),XMLDTDEntity=require("./XMLDTDEntity"),XMLDTDNotation=require("./XMLDTDNotation"),XMLWriterBase=require("./XMLWriterBase"),module.exports=XMLStringWriter=function(superClass){function XMLStringWriter(options){XMLStringWriter.__super__.constructor.call(this,options)}return extend(XMLStringWriter,superClass),XMLStringWriter.prototype.document=function(doc){var child,i,len,r,ref;for(this.textispresent=!1,r="",ref=doc.children,i=0,len=ref.length;len>i;i++)child=ref[i],r+=function(){switch(!1){case!(child instanceof XMLDeclaration):return this.declaration(child);case!(child instanceof XMLDocType):return this.docType(child);case!(child instanceof XMLComment):return this.comment(child);case!(child instanceof XMLProcessingInstruction):return this.processingInstruction(child);default:return this.element(child,0)}}.call(this);return this.pretty&&r.slice(-this.newline.length)===this.newline&&(r=r.slice(0,-this.newline.length)),r},XMLStringWriter.prototype.attribute=function(att){return" "+att.name+'="'+att.value+'"'},XMLStringWriter.prototype.cdata=function(node,level){return this.space(level)+"<![CDATA["+node.text+"]]>"+this.newline},XMLStringWriter.prototype.comment=function(node,level){return this.space(level)+"<!-- "+node.text+" -->"+this.newline},XMLStringWriter.prototype.declaration=function(node,level){var r;return r=this.space(level),r+='<?xml version="'+node.version+'"',null!=node.encoding&&(r+=' encoding="'+node.encoding+'"'),null!=node.standalone&&(r+=' standalone="'+node.standalone+'"'),r+=this.spacebeforeslash+"?>",r+=this.newline},XMLStringWriter.prototype.docType=function(node,level){var child,i,len,r,ref;if(level||(level=0),r=this.space(level),r+="<!DOCTYPE "+node.root().name,node.pubID&&node.sysID?r+=' PUBLIC "'+node.pubID+'" "'+node.sysID+'"':node.sysID&&(r+=' SYSTEM "'+node.sysID+'"'),node.children.length>0){for(r+=" [",r+=this.newline,ref=node.children,i=0,len=ref.length;len>i;i++)child=ref[i],r+=function(){switch(!1){case!(child instanceof XMLDTDAttList):return this.dtdAttList(child,level+1);case!(child instanceof XMLDTDElement):return this.dtdElement(child,level+1);case!(child instanceof XMLDTDEntity):return this.dtdEntity(child,level+1);case!(child instanceof XMLDTDNotation):return this.dtdNotation(child,level+1);case!(child instanceof XMLCData):return this.cdata(child,level+1);case!(child instanceof XMLComment):return this.comment(child,level+1);case!(child instanceof XMLProcessingInstruction):return this.processingInstruction(child,level+1);default:throw new Error("Unknown DTD node type: "+child.constructor.name)}}.call(this);r+="]"}return r+=this.spacebeforeslash+">",r+=this.newline},XMLStringWriter.prototype.element=function(node,level){var att,child,i,j,len,len1,name,r,ref,ref1,ref2,space,textispresentwasset;level||(level=0),textispresentwasset=!1,this.textispresent?(this.newline="",this.pretty=!1):(this.newline=this.newlinedefault,this.pretty=this.prettydefault),space=this.space(level),r="",r+=space+"<"+node.name,ref=node.attributes;for(name in ref)hasProp.call(ref,name)&&(att=ref[name],r+=this.attribute(att));if(0===node.children.length||node.children.every(function(e){return""===e.value}))r+=this.allowEmpty?"></"+node.name+">"+this.newline:this.spacebeforeslash+"/>"+this.newline;else if(this.pretty&&1===node.children.length&&null!=node.children[0].value)r+=">",r+=node.children[0].value,r+="</"+node.name+">"+this.newline;else{if(this.dontprettytextnodes)for(ref1=node.children,i=0,len=ref1.length;len>i;i++)if(child=ref1[i],null!=child.value){this.textispresent++,textispresentwasset=!0;break}for(this.textispresent&&(this.newline="",this.pretty=!1,space=this.space(level)),r+=">"+this.newline,ref2=node.children,j=0,len1=ref2.length;len1>j;j++)child=ref2[j],r+=function(){switch(!1){case!(child instanceof XMLCData):return this.cdata(child,level+1);case!(child instanceof XMLComment):return this.comment(child,level+1);case!(child instanceof XMLElement):return this.element(child,level+1);case!(child instanceof XMLRaw):return this.raw(child,level+1);case!(child instanceof XMLText):return this.text(child,level+1);case!(child instanceof XMLProcessingInstruction):return this.processingInstruction(child,level+1);default:throw new Error("Unknown XML node type: "+child.constructor.name)}}.call(this);textispresentwasset&&this.textispresent--,this.textispresent||(this.newline=this.newlinedefault,this.pretty=this.prettydefault),r+=space+"</"+node.name+">"+this.newline}return r},XMLStringWriter.prototype.processingInstruction=function(node,level){var r;return r=this.space(level)+"<?"+node.target,node.value&&(r+=" "+node.value),r+=this.spacebeforeslash+"?>"+this.newline},XMLStringWriter.prototype.raw=function(node,level){return this.space(level)+node.value+this.newline},XMLStringWriter.prototype.text=function(node,level){return this.space(level)+node.value+this.newline},XMLStringWriter.prototype.dtdAttList=function(node,level){var r;return r=this.space(level)+"<!ATTLIST "+node.elementName+" "+node.attributeName+" "+node.attributeType,"#DEFAULT"!==node.defaultValueType&&(r+=" "+node.defaultValueType),node.defaultValue&&(r+=' "'+node.defaultValue+'"'),r+=this.spacebeforeslash+">"+this.newline},XMLStringWriter.prototype.dtdElement=function(node,level){return this.space(level)+"<!ELEMENT "+node.name+" "+node.value+this.spacebeforeslash+">"+this.newline},XMLStringWriter.prototype.dtdEntity=function(node,level){var r;return r=this.space(level)+"<!ENTITY",node.pe&&(r+=" %"),r+=" "+node.name,node.value?r+=' "'+node.value+'"':(node.pubID&&node.sysID?r+=' PUBLIC "'+node.pubID+'" "'+node.sysID+'"':node.sysID&&(r+=' SYSTEM "'+node.sysID+'"'),node.nData&&(r+=" NDATA "+node.nData)),r+=this.spacebeforeslash+">"+this.newline},XMLStringWriter.prototype.dtdNotation=function(node,level){var r;return r=this.space(level)+"<!NOTATION "+node.name,node.pubID&&node.sysID?r+=' PUBLIC "'+node.pubID+'" "'+node.sysID+'"':node.pubID?r+=' PUBLIC "'+node.pubID+'"':node.sysID&&(r+=' SYSTEM "'+node.sysID+'"'),r+=this.spacebeforeslash+">"+this.newline},XMLStringWriter.prototype.openNode=function(node,level){var att,name,r,ref;if(level||(level=0),node instanceof XMLElement){r=this.space(level)+"<"+node.name,ref=node.attributes;for(name in ref)hasProp.call(ref,name)&&(att=ref[name],r+=this.attribute(att));return r+=(node.children?">":"/>")+this.newline}return r=this.space(level)+"<!DOCTYPE "+node.rootNodeName,node.pubID&&node.sysID?r+=' PUBLIC "'+node.pubID+'" "'+node.sysID+'"':node.sysID&&(r+=' SYSTEM "'+node.sysID+'"'),r+=(node.children?" [":">")+this.newline},XMLStringWriter.prototype.closeNode=function(node,level){switch(level||(level=0),!1){case!(node instanceof XMLElement):return this.space(level)+"</"+node.name+">"+this.newline;case!(node instanceof XMLDocType):return this.space(level)+"]>"+this.newline}},XMLStringWriter}(XMLWriterBase)}).call(this)},{"./XMLCData":70,"./XMLComment":71,"./XMLDTDAttList":72,"./XMLDTDElement":73,"./XMLDTDEntity":74,"./XMLDTDNotation":75,"./XMLDeclaration":76,"./XMLDocType":77,"./XMLElement":80,"./XMLProcessingInstruction":82,"./XMLRaw":83,"./XMLText":87,"./XMLWriterBase":88}],86:[function(require,module,exports){(function(){var XMLStringifier,bind=function(fn,me){return function(){return fn.apply(me,arguments)}},hasProp={}.hasOwnProperty;module.exports=XMLStringifier=function(){function XMLStringifier(options){this.assertLegalChar=bind(this.assertLegalChar,this);var key,ref,value;options||(options={}),this.noDoubleEncoding=options.noDoubleEncoding,ref=options.stringify||{};for(key in ref)hasProp.call(ref,key)&&(value=ref[key],this[key]=value)}return XMLStringifier.prototype.eleName=function(val){return val=""+val||"",this.assertLegalChar(val)},XMLStringifier.prototype.eleText=function(val){return val=""+val||"",this.assertLegalChar(this.elEscape(val))},XMLStringifier.prototype.cdata=function(val){return val=""+val||"",val=val.replace("]]>","]]]]><![CDATA[>"),this.assertLegalChar(val)},XMLStringifier.prototype.comment=function(val){if(val=""+val||"",val.match(/--/))throw new Error("Comment text cannot contain double-hypen: "+val);return this.assertLegalChar(val)},XMLStringifier.prototype.raw=function(val){return""+val||""},XMLStringifier.prototype.attName=function(val){return val=""+val||""},XMLStringifier.prototype.attValue=function(val){return val=""+val||"",this.attEscape(val)},XMLStringifier.prototype.insTarget=function(val){return""+val||""},XMLStringifier.prototype.insValue=function(val){if(val=""+val||"",val.match(/\?>/))throw new Error("Invalid processing instruction value: "+val);return val},XMLStringifier.prototype.xmlVersion=function(val){if(val=""+val||"",!val.match(/1\.[0-9]+/))throw new Error("Invalid version number: "+val);return val},XMLStringifier.prototype.xmlEncoding=function(val){if(val=""+val||"",!val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/))throw new Error("Invalid encoding: "+val);return val},XMLStringifier.prototype.xmlStandalone=function(val){return val?"yes":"no"},XMLStringifier.prototype.dtdPubID=function(val){return""+val||""},XMLStringifier.prototype.dtdSysID=function(val){return""+val||""},XMLStringifier.prototype.dtdElementValue=function(val){return""+val||""},XMLStringifier.prototype.dtdAttType=function(val){return""+val||""},XMLStringifier.prototype.dtdAttDefault=function(val){return null!=val?""+val||"":val},XMLStringifier.prototype.dtdEntityValue=function(val){return""+val||""},XMLStringifier.prototype.dtdNData=function(val){return""+val||""},XMLStringifier.prototype.convertAttKey="@",XMLStringifier.prototype.convertPIKey="?",XMLStringifier.prototype.convertTextKey="#text",XMLStringifier.prototype.convertCDataKey="#cdata",XMLStringifier.prototype.convertCommentKey="#comment",XMLStringifier.prototype.convertRawKey="#raw",XMLStringifier.prototype.assertLegalChar=function(str){var res;if(res=str.match(/[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/))throw new Error("Invalid character in string: "+str+" at index "+res.index);return str},XMLStringifier.prototype.elEscape=function(str){var ampregex;return ampregex=this.noDoubleEncoding?/(?!&\S+;)&/g:/&/g,str.replace(ampregex,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\r/g,"&#xD;")},XMLStringifier.prototype.attEscape=function(str){var ampregex;return ampregex=this.noDoubleEncoding?/(?!&\S+;)&/g:/&/g,str.replace(ampregex,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;").replace(/\t/g,"&#x9;").replace(/\n/g,"&#xA;").replace(/\r/g,"&#xD;")},XMLStringifier}()}).call(this)},{}],87:[function(require,module,exports){(function(){var XMLNode,XMLText,extend=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},hasProp={}.hasOwnProperty;XMLNode=require("./XMLNode"),module.exports=XMLText=function(superClass){function XMLText(parent,text){if(XMLText.__super__.constructor.call(this,parent),null==text)throw new Error("Missing element text. "+this.debugInfo());this.value=this.stringify.eleText(text)}return extend(XMLText,superClass),XMLText.prototype.clone=function(){return Object.create(this)},XMLText.prototype.toString=function(options){return this.options.writer.set(options).text(this)},XMLText}(XMLNode)}).call(this)},{"./XMLNode":81}],88:[function(require,module,exports){(function(){var XMLWriterBase,hasProp={}.hasOwnProperty;module.exports=XMLWriterBase=function(){function XMLWriterBase(options){var key,ref,ref1,ref2,ref3,ref4,ref5,ref6,value;options||(options={}),this.pretty=options.pretty||!1,this.allowEmpty=null!=(ref=options.allowEmpty)?ref:!1,this.pretty?(this.indent=null!=(ref1=options.indent)?ref1:"  ",this.newline=null!=(ref2=options.newline)?ref2:"\n",this.offset=null!=(ref3=options.offset)?ref3:0,this.dontprettytextnodes=null!=(ref4=options.dontprettytextnodes)?ref4:0):(this.indent="",this.newline="",this.offset=0,this.dontprettytextnodes=0),this.spacebeforeslash=null!=(ref5=options.spacebeforeslash)?ref5:"",this.spacebeforeslash===!0&&(this.spacebeforeslash=" "),this.newlinedefault=this.newline,this.prettydefault=this.pretty,ref6=options.writer||{};for(key in ref6)hasProp.call(ref6,key)&&(value=ref6[key],this[key]=value)}return XMLWriterBase.prototype.set=function(options){var key,ref,value;options||(options={}),"pretty"in options&&(this.pretty=options.pretty),"allowEmpty"in options&&(this.allowEmpty=options.allowEmpty),this.pretty?(this.indent="indent"in options?options.indent:"  ",this.newline="newline"in options?options.newline:"\n",this.offset="offset"in options?options.offset:0,this.dontprettytextnodes="dontprettytextnodes"in options?options.dontprettytextnodes:0):(this.indent="",this.newline="",this.offset=0,this.dontprettytextnodes=0),this.spacebeforeslash="spacebeforeslash"in options?options.spacebeforeslash:"",this.spacebeforeslash===!0&&(this.spacebeforeslash=" "),this.newlinedefault=this.newline,this.prettydefault=this.pretty,ref=options.writer||{};for(key in ref)hasProp.call(ref,key)&&(value=ref[key],this[key]=value);return this},XMLWriterBase.prototype.space=function(level){var indent;return this.pretty?(indent=(level||0)+this.offset+1,indent>0?new Array(indent).join(this.indent):""):""},XMLWriterBase}()}).call(this)},{}],89:[function(require,module,exports){(function(){var XMLDocument,XMLDocumentCB,XMLStreamWriter,XMLStringWriter,assign,isFunction,ref;ref=require("./Utility"),assign=ref.assign,isFunction=ref.isFunction,XMLDocument=require("./XMLDocument"),XMLDocumentCB=require("./XMLDocumentCB"),XMLStringWriter=require("./XMLStringWriter"),XMLStreamWriter=require("./XMLStreamWriter"),module.exports.create=function(name,xmldec,doctype,options){var doc,root;if(null==name)throw new Error("Root element needs a name.");return options=assign({},xmldec,doctype,options),doc=new XMLDocument(options),root=doc.element(name),options.headless||(doc.declaration(options),(null!=options.pubID||null!=options.sysID)&&doc.doctype(options)),root},module.exports.begin=function(options,onData,onEnd){var ref1;return isFunction(options)&&(ref1=[options,onData],onData=ref1[0],onEnd=ref1[1],options={}),onData?new XMLDocumentCB(options,onData,onEnd):new XMLDocument(options)},module.exports.stringWriter=function(options){return new XMLStringWriter(options)},module.exports.streamWriter=function(stream,options){return new XMLStreamWriter(stream,options)}}).call(this)},{"./Utility":68,"./XMLDocument":78,"./XMLDocumentCB":79,"./XMLStreamWriter":84,"./XMLStringWriter":85}]},{},[21])(21)});


/* Generated by build.mjs. Edit src/ modules, then run: node build.mjs */
window.__ModuleLoader__.load({
  id: 'dsh-witty',
  factory(require) {
    const React = require('react')
    const modules = {
      "entry.js": function (module, exports, require) {
        const { h, NS } = require('./shared.js')
        const { ZH, EN } = require('./locales.js')
        const { LearningAssistantIcon } = require('./icons.js')
        const { LearningShell } = require('./shell.js')

        module.exports = {
          inject: ['slots', 'locale'],
          apply(ctx) {
            ctx.effect(() => ctx.locale.register(NS, 'zh', ZH))
            ctx.effect(() => ctx.locale.register(NS, 'en', EN))

            const t = ctx.locale.bind(NS)

            ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
              name: 'sidebar.panellist',
              id: 'witty',
              order: 20,
              label: () => t('learningAssistantTitle'),
            }, LearningAssistantIcon))

            ctx.slots.inject('main', () => ctx.slots.register({
              name: 'main',
              key: 'witty',
            }, (props) => h(LearningShell, { ...props, ctx })))
          },
        }

      },
      "essay/EssayArchive.js": function (module, exports, require) {
        const {
          React, h, useCallback, useEffect, useState,
          requestJson, useT,
        } = require('../shared.js')

        const ARCHIVE_CSS = `
          .tp-archive {
            flex: 1 1 auto;
            min-height: 0;
            overflow: auto;
            padding: 2px 2px 18px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .tp-archiveToolbar {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }
          .tp-archiveTitle {
            margin: 0;
            font-size: 17px;
            line-height: 1.4;
            font-weight: 650;
          }
          .tp-archiveSubtitle {
            margin: 3px 0 0;
            color: rgba(244, 247, 248, 0.55);
            font-size: 11.5px;
            line-height: 1.5;
          }
          .tp-archiveActions {
            display: flex;
            gap: 7px;
            flex-wrap: wrap;
          }
          .tp-archiveList {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .tp-archiveItem {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
            box-sizing: border-box;
            padding: 11px 12px;
            border: 1px solid rgba(255, 255, 255, 0.13);
            border-radius: 11px;
            background: rgba(8, 14, 24, 0.46);
            color: #f4f7f8;
            text-align: left;
            cursor: pointer;
          }
          .tp-archiveItem:hover {
            border-color: rgba(216, 199, 163, 0.52);
            background: rgba(216, 199, 163, 0.08);
          }
          .tp-archiveItemMain { min-width: 0; flex: 1 1 auto; }
          .tp-archiveItemTop {
            display: flex;
            align-items: center;
            gap: 7px;
            flex-wrap: wrap;
            color: rgba(244, 247, 248, 0.52);
            font-size: 10.5px;
          }
          .tp-archiveCategory {
            padding: 1px 7px;
            border: 1px solid rgba(216, 199, 163, 0.30);
            border-radius: 999px;
            color: #e6d6b5;
          }
          .tp-archiveTopic {
            margin: 5px 0 0;
            color: rgba(244, 247, 248, 0.82);
            font-size: 12.5px;
            line-height: 1.6;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .tp-archiveScore {
            flex: 0 0 auto;
            color: #e6d6b5;
            font-size: 13px;
            font-weight: 650;
            white-space: nowrap;
          }
          .tp-archiveEmpty,
          .tp-archiveError,
          .tp-archiveLoading {
            padding: 34px 10px;
            color: rgba(244, 247, 248, 0.56);
            font-size: 12.5px;
            line-height: 1.7;
            text-align: center;
          }
          .tp-archiveError { color: #ffb3b3; }
          .tp-archiveDetail {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .tp-archiveDetailHead {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          }
          .tp-archiveDetailTitle {
            margin: 0;
            font-size: 15px;
            line-height: 1.55;
            font-weight: 600;
          }
          .tp-archiveSection {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .tp-archiveSectionTitle {
            margin: 0;
            color: #e6d6b5;
            font-size: 10.5px;
            line-height: 1.4;
            font-weight: 650;
            letter-spacing: .07em;
            text-transform: uppercase;
          }
          .tp-archiveDrawing {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 10px;
            background: #ffffff;
            overflow: auto;
          }
          .tp-archiveDrawing svg {
            display: block;
            width: 100%;
            height: auto;
            max-height: 280px;
          }
          .tp-archiveEssay {
            margin: 0;
            padding: 9px 10px;
            border: 1px solid rgba(255, 255, 255, 0.11);
            border-radius: 9px;
            background: rgba(8, 14, 24, 0.40);
            color: rgba(244, 247, 248, 0.82);
            font-size: 12.5px;
            line-height: 1.8;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }
          .tp-archiveScoreGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 7px;
          }
          .tp-archiveScoreBox {
            padding: 8px 9px;
            border: 1px solid rgba(255, 255, 255, 0.11);
            border-radius: 8px;
            background: rgba(8, 14, 24, 0.36);
          }
          .tp-archiveScoreLabel {
            display: block;
            color: rgba(244, 247, 248, 0.48);
            font-size: 10px;
          }
          .tp-archiveScoreValue {
            display: block;
            margin-top: 2px;
            color: #f4f7f8;
            font-size: 15px;
            font-weight: 650;
          }
          .tp-archiveFeedback {
            margin: 0;
            padding: 8px 9px;
            border-left: 2px solid rgba(216, 199, 163, 0.42);
            background: rgba(216, 199, 163, 0.06);
            color: rgba(244, 247, 248, 0.68);
            font-size: 11.5px;
            line-height: 1.7;
          }
          .tp-archiveHighlights {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .tp-archiveHighlight {
            padding: 7px 9px;
            border: 1px solid rgba(255, 255, 255, 0.11);
            border-radius: 8px;
            background: rgba(8, 14, 24, 0.36);
            color: rgba(244, 247, 248, 0.70);
            font-size: 11.5px;
            line-height: 1.6;
          }
          .tp-archiveHighlight strong {
            color: #e6d6b5;
            font-weight: 600;
          }
          .tp-archiveImport {
            align-self: flex-start;
            padding: 9px 14px;
            border: 1px solid transparent;
            border-radius: 9px;
            background: #d8c7a3;
            color: #08111f;
            font: inherit;
            font-size: 12px;
            font-weight: 650;
            cursor: pointer;
          }
          .tp-archiveImport:disabled {
            opacity: .42;
            cursor: not-allowed;
          }
          @media (max-width: 620px) {
            .tp-archiveScoreGrid { grid-template-columns: 1fr; }
          }
        `

        function formatDate(value) {
          const date = new Date(value)
          if (Number.isNaN(date.getTime())) return String(value ?? '')
          const pad = (input) => String(input).padStart(2, '0')
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        }

        function categoryLabel(category) {
          if (category === null || category === undefined) return ''
          if (typeof category === 'string') return category
          return category.label || category.id || ''
        }

        function isSafeArchiveSvg(value) {
          if (typeof value !== 'string') return false
          const svg = value.trim()
          return /^<svg[\s>]/i.test(svg)
            && /<\/svg>$/i.test(svg)
            && !/<script\b|\bon[a-z]+\s*=|javascript\s*:/i.test(svg)
        }

        function EssayArchiveView(props) {
          const { ctx, onImportSample } = props
          const t = useT(ctx)
          const [list, setList] = useState({ status: 'loading', items: [], error: null })
          const [selected, setSelected] = useState({ status: 'idle', item: null, error: null })
          const [exporting, setExporting] = useState(false)

          const load = useCallback(async () => {
            setList((current) => ({ ...current, status: 'loading', error: null }))
            try {
              const data = await requestJson('/essay/archive')
              setList({
                status: 'ready',
                items: Array.isArray(data?.items) ? data.items : [],
                error: null,
              })
            } catch (error) {
              setList({ status: 'error', items: [], error: error?.message || t('essayArchiveError') })
            }
          }, [t])

          useEffect(() => {
            void load()
          }, [load])

          const openDetail = useCallback(async (item) => {
            setSelected({ status: 'loading', item: null, error: null })
            try {
              const data = await requestJson('/essay/archive/detail', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ id: item.id }),
              })
              setSelected({ status: 'ready', item: data?.item ?? null, error: null })
            } catch (error) {
              setSelected({ status: 'error', item: null, error: error?.message || t('essayArchiveError') })
            }
          }, [t])

          const exportAll = useCallback(async () => {
            setExporting(true)
            try {
              const data = await requestJson('/essay/archive/export')
              const blob = new Blob([JSON.stringify(data?.records ?? [], null, 2)], {
                type: 'application/json;charset=utf-8',
              })
              const url = URL.createObjectURL(blob)
              const anchor = document.createElement('a')
              anchor.href = url
              anchor.download = `essay-archive-${new Date().toISOString().slice(0, 10)}.json`
              document.body.appendChild(anchor)
              anchor.click()
              anchor.remove()
              window.setTimeout(() => URL.revokeObjectURL(url), 1000)
            } catch (error) {
              setList((current) => ({ ...current, error: error?.message || t('essayArchiveExportError') }))
            } finally {
              setExporting(false)
            }
          }, [t])

          function importSample(item) {
            if (typeof onImportSample !== 'function' || typeof item?.sample_essay !== 'string' || item.sample_essay.length === 0) {
              return
            }
            onImportSample({
              title: `${t('essayArchiveTypingTitle')} · ${categoryLabel(item.category)}`,
              text: item.sample_essay,
            })
          }

          if (selected.status !== 'idle') {
            const item = selected.item
            if (selected.status === 'loading') {
              return h('div', { className: 'tp-archive' }, h('div', { className: 'tp-archiveLoading' }, t('essayArchiveLoading')))
            }
            if (selected.status === 'error' || item === null) {
              return h(
                'div',
                { className: 'tp-archive' },
                h('div', { className: 'tp-alert' }, selected.error || t('essayArchiveError')),
                h('button', { className: 'tp-btn', type: 'button', onClick: () => setSelected({ status: 'idle', item: null, error: null }) }, t('essayArchiveBack')),
              )
            }
            const feedback = item.ai_feedback || {}
            const dimensions = feedback.dimensions || {}
            const paragraphs = Array.isArray(feedback.paragraph_feedback) ? feedback.paragraph_feedback : []
            return h(
              'div',
              { className: 'tp-archive' },
              h('style', null, ARCHIVE_CSS),
              h(
                'div',
                { className: 'tp-archiveActions' },
                h('button', { className: 'tp-btn', type: 'button', onClick: () => setSelected({ status: 'idle', item: null, error: null }) }, t('essayArchiveBack')),
              ),
              h(
                'div',
                { className: 'tp-archiveDetail' },
                h(
                  'div',
                  { className: 'tp-archiveDetailHead' },
                  h(
                    'div',
                    null,
                    h('div', { className: 'tp-archiveItemTop' }, formatDate(item.date), h('span', { className: 'tp-archiveCategory' }, categoryLabel(item.category))),
                    h('h2', { className: 'tp-archiveDetailTitle' }, item.topic_prompt),
                  ),
                  h('span', { className: 'tp-archiveScore' }, feedback.total_score === undefined ? '—' : `${feedback.total_score} / 20`),
                ),
                isSafeArchiveSvg(item.drawing_svg)
                  ? h(
                      'section',
                      { className: 'tp-archiveSection' },
                      h('h3', { className: 'tp-archiveSectionTitle' }, t('essayArchiveDrawing')),
                      h('div', {
                        className: 'tp-archiveDrawing',
                        dangerouslySetInnerHTML: { __html: item.drawing_svg },
                      }),
                    )
                  : null,
                h(
                  'section',
                  { className: 'tp-archiveSection' },
                  h('h3', { className: 'tp-archiveSectionTitle' }, t('essayArchiveUserEssay')),
                  h('p', { className: 'tp-archiveEssay' }, item.user_essay),
                ),
                h(
                  'section',
                  { className: 'tp-archiveSection' },
                  h('h3', { className: 'tp-archiveSectionTitle' }, t('essayArchiveFeedback')),
                  h(
                    'div',
                    { className: 'tp-archiveScoreGrid' },
                    [['content', t('essayDimensionContent')], ['structure', t('essayDimensionStructure')], ['language', t('essayDimensionLanguage')]].map(([key, label]) => h(
                      'div',
                      { className: 'tp-archiveScoreBox', key },
                      h('span', { className: 'tp-archiveScoreLabel' }, label),
                      h('span', { className: 'tp-archiveScoreValue' }, `${dimensions[key] ?? '—'} / 5`),
                    )),
                  ),
                  paragraphs.map((paragraph, index) => h(
                    'div',
                    { key: index },
                    h('p', { className: 'tp-archiveSectionTitle' }, `${t('essayParagraphPrefix')} ${paragraph.paragraph_index ?? index + 1}`),
                    h('p', { className: 'tp-archiveFeedback' }, paragraph.paragraph_critique || ''),
                    paragraph.rewritten_paragraph
                      ? h('p', { className: 'tp-archiveEssay' }, paragraph.rewritten_paragraph)
                      : null,
                  )),
                ),
                h(
                  'section',
                  { className: 'tp-archiveSection' },
                  h('h3', { className: 'tp-archiveSectionTitle' }, t('essayArchiveSample')),
                  item.sample_essay
                    ? h('p', { className: 'tp-archiveEssay' }, item.sample_essay)
                    : h('p', { className: 'tp-archiveFeedback' }, t('essayArchiveNoSample')),
                  item.sample_translation
                    ? h('p', { className: 'tp-archiveFeedback' }, item.sample_translation)
                    : null,
                  Array.isArray(item.sample_highlights) && item.sample_highlights.length > 0
                    ? h(
                        'div',
                        { className: 'tp-archiveHighlights' },
                        item.sample_highlights.map((highlight, index) => h(
                          'div',
                          { className: 'tp-archiveHighlight', key: index },
                          h('strong', null, highlight.text || highlight.kind || ''),
                          ` ${highlight.explanation || ''}`,
                        )),
                      )
                    : null,
                  item.core_argument
                    ? h('p', { className: 'tp-archiveSubtitle' }, `${t('essayArchiveCoreArgument')}：${item.core_argument}`)
                    : null,
                  item.sample_strategy
                    ? h('p', { className: 'tp-archiveSubtitle' }, `${t('essayArchiveStrategy')}：${item.sample_strategy}`)
                    : null,
                  h(
                    'button',
                    {
                      className: 'tp-archiveImport',
                      type: 'button',
                      disabled: typeof item.sample_essay !== 'string' || item.sample_essay.length === 0,
                      onClick: () => importSample(item),
                    },
                    t('essayArchiveImport'),
                  ),
                ),
              ),
            )
          }

          return h(
            'div',
            { className: 'tp-archive' },
            h('style', null, ARCHIVE_CSS),
            h(
              'div',
              { className: 'tp-archiveToolbar' },
              h(
                'div',
                null,
                h('h2', { className: 'tp-archiveTitle' }, t('essayArchiveTitle')),
                h('p', { className: 'tp-archiveSubtitle' }, t('essayArchiveSubtitle')),
              ),
              h(
                'div',
                { className: 'tp-archiveActions' },
                h('button', { className: 'tp-btn', type: 'button', onClick: () => { void load() } }, t('essayArchiveRefresh')),
                h('button', { className: 'tp-btn', type: 'button', disabled: exporting, onClick: () => { void exportAll() } }, exporting ? t('essayArchiveExporting') : t('essayArchiveExport')),
              ),
            ),
            list.status === 'error'
              ? h('div', { className: 'tp-archiveError' }, list.error)
              : list.status === 'loading' && list.items.length === 0
                ? h('div', { className: 'tp-archiveLoading' }, t('essayArchiveLoading'))
                : list.items.length === 0
                  ? h('div', { className: 'tp-archiveEmpty' }, t('essayArchiveEmpty'))
                  : h(
                      'div',
                      { className: 'tp-archiveList' },
                      list.items.map((item) => h(
                        'button',
                        {
                          className: 'tp-archiveItem',
                          type: 'button',
                          key: item.id,
                          onClick: () => { void openDetail(item) },
                        },
                        h(
                          'div',
                          { className: 'tp-archiveItemMain' },
                          h(
                            'div',
                            { className: 'tp-archiveItemTop' },
                            formatDate(item.date),
                            h('span', { className: 'tp-archiveCategory' }, categoryLabel(item.category)),
                            item.sample_strategy ? h('span', null, item.sample_strategy) : null,
                          ),
                          h('p', { className: 'tp-archiveTopic' }, item.topic_prompt),
                        ),
                        h('span', { className: 'tp-archiveScore' }, item.score === null ? '—' : `${item.score} / 20`),
                      )),
                    ),
          )
        }

        module.exports = { EssayArchiveView }

      },
      "essay/EssaySampleModal.js": function (module, exports, require) {
        const { React, h, useEffect } = require('../shared.js')

        const SAMPLE_CSS = `
          .tp-sampleLayer {
            position: fixed;
            inset: 0;
            z-index: 128;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            padding: 20px;
          }
          .tp-sampleBackdrop {
            position: absolute;
            inset: 0;
            background: rgba(2, 6, 14, 0.60);
            backdrop-filter: blur(4px);
          }
          .tp-sampleCard {
            position: relative;
            z-index: 1;
            width: min(900px, 96vw);
            max-height: calc(100vh - 40px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 20px;
            background:
              linear-gradient(145deg, rgba(28, 43, 64, 0.97), rgba(9, 17, 30, 0.95));
            color: #f2f6ff;
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.46);
          }
          .tp-sampleCard button {
            font: inherit;
          }
          .tp-sampleClose {
            position: absolute;
            top: 14px;
            right: 14px;
            z-index: 2;
            width: 30px;
            height: 30px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 8px;
            background: rgba(10, 17, 28, 0.58);
            color: rgba(244, 247, 248, 0.72);
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
          }
          .tp-sampleClose:hover {
            color: #f4f7f8;
            border-color: rgba(216, 199, 163, 0.62);
          }
          .tp-sampleHead {
            flex: 0 0 auto;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding: 20px 24px 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.14);
          }
          .tp-sampleTitle {
            margin: 0;
            padding-right: 30px;
            font-size: 20px;
            line-height: 1.35;
            font-weight: 650;
          }
          .tp-sampleMeta {
            margin: 5px 0 0;
            color: rgba(244, 247, 248, 0.58);
            font-size: 11.5px;
            line-height: 1.5;
          }
          .tp-sampleScroll {
            flex: 1 1 auto;
            min-height: 0;
            overflow: auto;
            padding: 18px 24px 22px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .tp-sampleSection {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .tp-sampleSectionTitle {
            margin: 0;
            color: #e6d6b5;
            font-size: 11px;
            line-height: 1.4;
            font-weight: 650;
            letter-spacing: .08em;
            text-transform: uppercase;
          }
          .tp-sampleParagraph {
            margin: 0;
            color: rgba(244, 247, 248, 0.90);
            font-size: 14.5px;
            line-height: 1.9;
          }
          .tp-sampleTranslation {
            margin: 0;
            color: rgba(244, 247, 248, 0.76);
            font-size: 13.5px;
            line-height: 1.9;
          }
          .tp-sampleHighlights {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .tp-sampleHighlight {
            padding: 10px 12px;
            border: 1px solid rgba(255, 255, 255, 0.13);
            border-radius: 10px;
            background: rgba(8, 14, 24, 0.42);
          }
          .tp-sampleHighlightKind {
            display: inline-flex;
            margin-bottom: 4px;
            padding: 2px 7px;
            border-radius: 999px;
            background: rgba(216, 199, 163, 0.14);
            color: #e6d6b5;
            font-size: 10px;
            font-weight: 650;
            letter-spacing: .05em;
          }
          .tp-sampleHighlightText {
            margin: 0;
            color: #f4f7f8;
            font-size: 13px;
            line-height: 1.6;
            font-weight: 550;
          }
          .tp-sampleHighlightExplanation {
            margin: 3px 0 0;
            color: rgba(244, 247, 248, 0.62);
            font-size: 12px;
            line-height: 1.6;
          }
          .tp-sampleLoading,
          .tp-sampleError {
            padding: 36px 12px;
            color: rgba(244, 247, 248, 0.62);
            font-size: 13px;
            line-height: 1.7;
            text-align: center;
          }
          .tp-sampleError { color: #ffb3b3; }
          .tp-sampleRetry {
            display: block;
            margin: 10px auto 0;
            border: none;
            background: transparent;
            color: #e6d6b5;
            font-size: 12px;
            cursor: pointer;
          }
          .tp-sampleFooter {
            flex: 0 0 auto;
            padding: 13px 24px 18px;
            border-top: 1px solid rgba(255, 255, 255, 0.14);
          }
          .tp-sampleImport {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid transparent;
            border-radius: 12px;
            background: #d8c7a3;
            color: #08111f;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 100ms ease-out, background 180ms ease;
          }
          .tp-sampleImport:hover {
            background: #e6d6b5;
          }
          .tp-sampleImport:active {
            transform: scale(0.985);
          }
          .tp-sampleImport:disabled {
            opacity: .45;
            cursor: not-allowed;
          }
          @media (max-width: 620px) {
            .tp-sampleLayer { padding: 10px; }
            .tp-sampleCard { max-height: calc(100vh - 20px); }
            .tp-sampleHead { padding: 18px 16px 12px; }
            .tp-sampleScroll { padding: 14px 16px 18px; }
            .tp-sampleFooter { padding: 12px 16px 14px; }
          }
        `

        function sampleParagraphs(text) {
          return String(text)
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
        }

        function EssaySampleModal(props) {
          const { t, state, onClose, onRetry, onImport } = props

          useEffect(() => {
            const onKeyDown = (event) => {
              if (event.key === 'Escape') onClose()
            }
            window.addEventListener('keydown', onKeyDown)
            return () => window.removeEventListener('keydown', onKeyDown)
          }, [onClose])

          const sample = state.status === 'ready' ? state.data : null
          const wordCount = sample === null
            ? 0
            : (sample.essay_text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? []).length

          function importSample() {
            if (sample === null) return
            const accepted = onImport(sample)
            if (accepted) onClose()
          }

          return h(
            'div',
            {
              className: 'tp-sampleLayer',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': t('essaySampleTitle'),
              onClick: onClose,
            },
            h('div', { className: 'tp-sampleBackdrop', 'aria-hidden': true }),
            h(
              'section',
              {
                className: 'tp-sampleCard',
                onClick: (event) => event.stopPropagation(),
              },
              h('style', null, SAMPLE_CSS),
              h(
                'button',
                {
                  className: 'tp-sampleClose',
                  type: 'button',
                  'aria-label': t('wordClose'),
                  title: t('wordClose'),
                  onClick: onClose,
                },
                '×',
              ),
              h(
                'header',
                { className: 'tp-sampleHead' },
                h(
                  'div',
                  null,
                  h('h2', { className: 'tp-sampleTitle' }, t('essaySampleTitle')),
                  sample === null
                    ? null
                    : h('p', { className: 'tp-sampleMeta' }, `${wordCount} ${t('essayWordUnit')} · 17–20 ${t('essaySampleBand')}`),
                ),
              ),
              state.status === 'loading'
                ? h('div', { className: 'tp-sampleLoading' }, t('essaySampleGenerating'))
                : state.status === 'error'
                  ? h(
                      'div',
                      { className: 'tp-sampleError' },
                      state.error?.message || t('essaySampleError'),
                      h(
                        'button',
                        { className: 'tp-sampleRetry', type: 'button', onClick: onRetry },
                        t('essaySampleRetry'),
                      ),
                    )
                  : sample === null
                    ? null
                    : h(
                        React.Fragment,
                        null,
                        h(
                          'div',
                          { className: 'tp-sampleScroll' },
                          h(
                            'section',
                            { className: 'tp-sampleSection' },
                            h('h3', { className: 'tp-sampleSectionTitle' }, t('essaySampleEnglish')),
                            sampleParagraphs(sample.essay_text).map((paragraph, index) => h(
                              'p',
                              { className: 'tp-sampleParagraph', key: index },
                              paragraph,
                            )),
                          ),
                          h(
                            'section',
                            { className: 'tp-sampleSection' },
                            h('h3', { className: 'tp-sampleSectionTitle' }, t('essaySampleTranslation')),
                            h('p', { className: 'tp-sampleTranslation' }, sample.translation),
                          ),
                          h(
                            'section',
                            { className: 'tp-sampleSection' },
                            h('h3', { className: 'tp-sampleSectionTitle' }, t('essaySampleHighlights')),
                            h(
                              'div',
                              { className: 'tp-sampleHighlights' },
                              sample.highlights.map((item, index) => h(
                                'div',
                                { className: 'tp-sampleHighlight', key: index },
                                h(
                                  'span',
                                  { className: 'tp-sampleHighlightKind' },
                                  item.kind === 'vocabulary'
                                    ? t('essaySampleVocabulary')
                                    : t('essaySampleStructure'),
                                ),
                                h('p', { className: 'tp-sampleHighlightText' }, item.text),
                                h('p', { className: 'tp-sampleHighlightExplanation' }, item.explanation),
                              )),
                            ),
                          ),
                        ),
                        h(
                          'footer',
                          { className: 'tp-sampleFooter' },
                          h(
                            'button',
                            {
                              className: 'tp-sampleImport',
                              type: 'button',
                              onClick: importSample,
                            },
                            t('essaySampleImport'),
                          ),
                        ),
                      ),
            ),
          )
        }

        module.exports = { EssaySampleModal }

      },
      "essay/index.js": function (module, exports, require) {
        const {
          React, h, useCallback, useEffect, useMemo, useRef, useState,
          requestJson, useT,
        } = require('../shared.js')
        const { EssaySampleModal } = require('./EssaySampleModal.js')
        const { EssayArchiveView } = require('./EssayArchive.js')

            const ESSAY_POSITION_KEYS = {
              opening: 'essayPositionOpening',
              body: 'essayPositionBody',
              conclusion: 'essayPositionConclusion',
            }
            const ESSAY_CATEGORIES = [
              {
                id: 'society',
                zh: '社会热点',
                en: 'Society',
                descKey: 'essayCategorySocietyDesc',
              },
              {
                id: 'technology',
                zh: '科技与生活',
                en: 'Technology & Life',
                descKey: 'essayCategoryTechnologyDesc',
              },
              {
                id: 'culture_education',
                zh: '文化与教育',
                en: 'Culture & Education',
                descKey: 'essayCategoryCultureEducationDesc',
              },
              {
                id: 'philosophy',
                zh: '人生哲理',
                en: 'Philosophy',
                descKey: 'essayCategoryPhilosophyDesc',
              },
              {
                id: 'economy_business',
                zh: '经济与商业',
                en: 'Economy & Business',
                descKey: 'essayCategoryEconomyBusinessDesc',
              },
              {
                id: 'environment_health',
                zh: '环境与健康',
                en: 'Environment & Health',
                descKey: 'essayCategoryEnvironmentHealthDesc',
              },
            ]
            const ESSAY_CATEGORY_MAP = Object.fromEntries(
              ESSAY_CATEGORIES.map((category) => [category.id, category]),
            )
            function isSafeSvg(value) {
              if (typeof value !== 'string') return false
              const svg = value.trim()
              if (svg.length < 40 || svg.length > 30000) return false
              if (!/^<svg[\s>]/i.test(svg) || !/<\/svg>$/i.test(svg)) return false
              if (!/\bviewBox\s*=/i.test(svg)) return false
              if (/<\s*(script|foreignObject|iframe|object|embed|image|style|link|meta|form|input|button|audio|video|canvas)\b/i.test(svg)) return false
              if (/\bon[a-z]+\s*=/i.test(svg)) return false
              if (/(?:href|xlink:href)\s*=/i.test(svg)) return false
              if (/javascript\s*:|\bdata\s*:|url\s*\(/i.test(svg)) return false
              if (/\bstyle\s*=/i.test(svg)) return false
              return true
            }
            function assertEssayTopicPayload(value) {
              if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                throw new Error('话题数据不是对象。')
              }
              if (typeof value.topic_id !== 'string' || value.topic_id.trim().length === 0) {
                throw new Error('话题缺少 topic_id。')
              }
              if (typeof value.topic_prompt !== 'string' || value.topic_prompt.trim().length === 0) {
                throw new Error('话题缺少 topic_prompt。')
              }
              if (!isSafeSvg(value.drawing_svg)) {
                throw new Error('话题缺少可安全渲染的 drawing_svg。')
              }
              if (!Array.isArray(value.related_vocabulary)
                || value.related_vocabulary.length < 8
                || value.related_vocabulary.length > 12) {
                throw new Error('相关词汇数量必须是 8–12 项。')
              }
              for (const item of value.related_vocabulary) {
                if (typeof item?.word !== 'string' || item.word.trim().length === 0) {
                  throw new Error('相关词汇缺少英文词/短语。')
                }
                if (typeof item?.meaning !== 'string' || item.meaning.trim().length === 0) {
                  throw new Error('相关词汇缺少中文释义。')
                }
              }
              if (!Array.isArray(value.useful_expressions)
                || value.useful_expressions.length < 5
                || value.useful_expressions.length > 8) {
                throw new Error('相关表述数量必须是 5–8 项。')
              }
              for (const item of value.useful_expressions) {
                if (typeof item?.expression !== 'string' || item.expression.trim().length === 0) {
                  throw new Error('相关表述缺少英文句式。')
                }
                if (typeof item?.meaning !== 'string' || item.meaning.trim().length === 0) {
                  throw new Error('相关表述缺少中文说明。')
                }
                if (typeof ESSAY_POSITION_KEYS[item?.position] !== 'string') {
                  throw new Error('相关表述的适用位置无效。')
                }
              }
              if (!Array.isArray(value.cultural_background)
                || value.cultural_background.length < 3
                || value.cultural_background.length > 5) {
                throw new Error('文化背景必须是 3–5 条。')
              }
              if (value.cultural_background.some((item) => typeof item !== 'string' || item.trim().length === 0)) {
                throw new Error('文化背景包含空内容。')
              }

              return {
                topic_id: value.topic_id.trim(),
                topic_prompt: value.topic_prompt.trim(),
                drawing_svg: value.drawing_svg.trim(),
                related_vocabulary: value.related_vocabulary.map((item) => ({
                  word: item.word.trim(),
                  meaning: item.meaning.trim(),
                })),
                useful_expressions: value.useful_expressions.map((item) => ({
                  expression: item.expression.trim(),
                  meaning: item.meaning.trim(),
                  position: item.position,
                })),
                cultural_background: value.cultural_background.map((item) => item.trim()),
              }
            }
            function assertEssayScorePayload(value) {
              if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                throw new Error('评分数据不是对象。')
              }
              const dimensions = value.dimensions
              if (dimensions === null || typeof dimensions !== 'object' || Array.isArray(dimensions)) {
                throw new Error('评分缺少 dimensions。')
              }
              for (const key of ['content', 'structure', 'language']) {
                const score = dimensions[key]
                if (!Number.isInteger(score) || score < 1 || score > 5) {
                  throw new Error(`dimensions.${key} 必须是 1–5 的整数。`)
                }
              }
              const expectedTotal = Math.round(
                ((dimensions.content + dimensions.structure + dimensions.language) / 15) * 20,
              )
              if (!Number.isInteger(value.total_score) || value.total_score < 0 || value.total_score > 20) {
                throw new Error('total_score 必须是 0–20 的整数。')
              }
              if (value.total_score !== expectedTotal) {
                throw new Error('total_score 与三个维度的原始分不匹配。')
              }
              if (typeof value.band !== 'string' || value.band.trim().length === 0) {
                throw new Error('评分缺少 band。')
              }
              if (!Array.isArray(value.paragraph_feedback) || value.paragraph_feedback.length === 0) {
                throw new Error('评分缺少段落批改反馈。')
              }
              for (const item of value.paragraph_feedback) {
                if (!Number.isInteger(item?.paragraph_index) || item.paragraph_index < 1) {
                  throw new Error('段落批改缺少有效的 paragraph_index。')
                }
                if (typeof item?.original_text !== 'string' || item.original_text.trim().length === 0) {
                  throw new Error('段落批改缺少原文片段。')
                }
                if (typeof item?.paragraph_critique !== 'string' || item.paragraph_critique.trim().length === 0) {
                  throw new Error('段落批改缺少批改意见。')
                }
                if (typeof item?.rewritten_paragraph !== 'string' || item.rewritten_paragraph.trim().length === 0) {
                  throw new Error('段落批改缺少高分重写范文。')
                }
              }

              return {
                dimensions: {
                  content: dimensions.content,
                  structure: dimensions.structure,
                  language: dimensions.language,
                },
                total_score: value.total_score,
                band: value.band.trim(),
                paragraph_feedback: value.paragraph_feedback.map((item) => ({
                  paragraph_index: item.paragraph_index,
                  original_text: item.original_text.trim(),
                  paragraph_critique: item.paragraph_critique.trim(),
                  rewritten_paragraph: item.rewritten_paragraph.trim(),
                })),
              }
            }
            function assertEssayStatsPayload(value) {
              if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                throw new Error('作文统计不是对象。')
              }
              if (!Array.isArray(value.categories) || value.categories.length !== ESSAY_CATEGORIES.length) {
                throw new Error('作文统计分类数量不正确。')
              }
              const categories = value.categories.map((item) => {
                if (item === null || typeof item !== 'object' || Array.isArray(item)) {
                  throw new Error('作文统计分类项无效。')
                }
                if (!Object.prototype.hasOwnProperty.call(ESSAY_CATEGORY_MAP, item.category)) {
                  throw new Error('作文统计包含未知分类。')
                }
                if (!Number.isInteger(item.count) || item.count < 0) {
                  throw new Error('作文统计练习次数无效。')
                }
                if (
                  item.averageScore !== null
                  && (
                    typeof item.averageScore !== 'number'
                    || !Number.isFinite(item.averageScore)
                    || item.averageScore < 0
                    || item.averageScore > 20
                  )
                ) {
                  throw new Error('作文统计平均分无效。')
                }
                return {
                  category: item.category,
                  count: item.count,
                  averageScore: item.averageScore,
                  lastPracticedAt: typeof item.lastPracticedAt === 'string' ? item.lastPracticedAt : null,
                }
              })
              if (!Number.isInteger(value.totalAttempts) || value.totalAttempts < 0) {
                throw new Error('作文统计总次数无效。')
              }
              if (
                value.recommended === null
                || typeof value.recommended !== 'object'
                || !Object.prototype.hasOwnProperty.call(ESSAY_CATEGORY_MAP, value.recommended.category)
                || !['unpracticed', 'lowest_average'].includes(value.recommended.reason)
              ) {
                throw new Error('作文统计推荐项无效。')
              }
              return {
                totalAttempts: value.totalAttempts,
                categories,
                recommended: {
                  category: value.recommended.category,
                  reason: value.recommended.reason,
                },
              }
            }
            function assertEssaySamplePayload(value) {
              if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                throw new Error('范文数据不是对象。')
              }
              const essayText = typeof value.essay_text === 'string' ? value.essay_text.trim() : ''
              const translation = typeof value.translation === 'string' ? value.translation.trim() : ''
              if (essayText.length === 0) throw new Error('范文缺少英文正文。')
              if (translation.length === 0) throw new Error('范文缺少中文翻译。')
              if (!Array.isArray(value.highlights) || value.highlights.length < 3 || value.highlights.length > 5) {
                throw new Error('范文亮点必须是 3–5 条。')
              }
              const highlights = value.highlights.map((item) => {
                if (item === null || typeof item !== 'object' || Array.isArray(item)) {
                  throw new Error('范文亮点条目无效。')
                }
                if (!['vocabulary', 'structure'].includes(item.kind)) {
                  throw new Error('范文亮点类型无效。')
                }
                const text = typeof item.text === 'string' ? item.text.trim() : ''
                const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : ''
                if (text.length === 0 || explanation.length === 0) {
                  throw new Error('范文亮点缺少词汇或解析。')
                }
                return { kind: item.kind, text, explanation }
              })
              const coreArgument = typeof value.core_argument === 'string'
                ? value.core_argument.trim().slice(0, 500)
                : ''
              return {
                essay_text: essayText,
                translation,
                ...(coreArgument.length === 0 ? {} : { core_argument: coreArgument }),
                highlights,
              }
            }

            function essayPositionLabel(t, position) {
              const key = ESSAY_POSITION_KEYS[position]
              return key === undefined ? position : t(key)
            }
            function EssayScorePanel(props) {
              const { score, t, onRetry, canRetry } = props

              if (score.status === 'idle') {
                return h('div', { className: 'tp-essayScorePlaceholder' }, t('essayBeforeScore'))
              }
              if (score.status === 'loading') {
                return h(
                  'div',
                  { className: 'tp-quizLoading' },
                  h('div', { className: 'tp-quizSpinner' }),
                  h('div', { className: 'tp-quizLoadingText' }, t('essayScoreLoading')),
                  h('div', { className: 'tp-quizLoadingHint' }, t('essayScoreHint')),
                )
              }
              if (score.status === 'error') {
                return h(
                  'div',
                  { className: 'tp-essayScorePlaceholder' },
                  h(
                    'div',
                    { className: 'tp-alert' },
                    h(
                      'div',
                      { className: 'tp-alertText' },
                      h('div', null, score.error?.message || t('essayScoreError')),
                      h('div', { className: 'tp-alertHint' }, t('essayErrorHint')),
                    ),
                    h(
                      'button',
                      {
                        className: 'tp-btn',
                        type: 'button',
                        disabled: !canRetry,
                        onClick: onRetry,
                      },
                      t('essayRetryScore'),
                    ),
                  ),
                )
              }

              const data = score.data
              const dimensions = [
                ['content', t('essayDimensionContent')],
                ['structure', t('essayDimensionStructure')],
                ['language', t('essayDimensionLanguage')],
              ]

              return h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'tp-essayScoreHero' },
                  h(
                    'div',
                    null,
                    h('div', { className: 'tp-essayTotalLabel' }, t('essayTotalScore')),
                    h(
                      'div',
                      { className: 'tp-essayTotal' },
                      h('span', { className: 'tp-essayTotalNumber' }, String(data.total_score)),
                      h('span', { className: 'tp-essayTotalMax' }, '/ 20'),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'tp-essayBand' },
                    h('div', { className: 'tp-essayBandLabel' }, t('essayBand')),
                    h('div', { className: 'tp-essayBandValue' }, data.band),
                  ),
                ),
                h(
                  'div',
                  { className: 'tp-essayDimensionGrid' },
                  dimensions.map(([key, label]) => h(
                    'div',
                    { className: 'tp-essayDimension', key },
                    h('div', { className: 'tp-essayDimensionLabel' }, label),
                    h(
                      'div',
                      { className: 'tp-essayDimensionScore' },
                      String(data.dimensions[key]),
                      h('span', { className: 'tp-essayDimensionMax' }, ` / 5 ${t('essayDimensionUnit')}`),
                    ),
                  )),
                ),
                h('h3', { className: 'tp-essaySectionTitle' }, t('essayParagraphFeedbackTitle')),
                h(
                  'div',
                  { className: 'tp-essayParagraphList' },
                  data.paragraph_feedback.map((item, index) => h(
                    'article',
                    { className: 'tp-essayParagraph', key: index },
                    h(
                      'div',
                      { className: 'tp-essayParagraphHead' },
                      h(
                        'span',
                        { className: 'tp-essayParagraphIndex' },
                        `${t('essayParagraphPrefix')} ${item.paragraph_index} ${t('essayParagraphSuffix')}`.trim(),
                      ),
                    ),
                    h('div', { className: 'tp-essayParagraphOriginalLabel' }, t('essayParagraphOriginal')),
                    h('blockquote', { className: 'tp-essayExcerpt' }, item.original_text),
                    h(
                      'p',
                      { className: 'tp-essayFeedbackLine' },
                      h('strong', null, `${t('essayParagraphCritique')}：`),
                      item.paragraph_critique,
                    ),
                    h(
                      'div',
                      { className: 'tp-essayRewriteBlock' },
                      h('div', { className: 'tp-essayRewriteLabel' }, t('essayParagraphRewriteLabel')),
                      h('p', { className: 'tp-essayRewriteText' }, item.rewritten_paragraph),
                    ),
                  )),
                ),
                score.recordError
                  ? h(
                      'p',
                      { className: 'tp-essayArchiveError' },
                      `${t('essayRecordFailed')}${score.recordError.message || ''}`,
                    )
                  : null,
                score.provider
                  ? h(
                      'div',
                      { className: 'tp-essayProvider' },
                      `${t('essayModelLine')} · ${score.provider.name || 'DeepSeek'} / ${score.model}`,
                    )
                  : null,
              )
            }
            function EssayCategoryCard(props) {
              const { category, stat, recommended, maxCount, loading, t, onStart } = props
              const isRecommended = recommended !== null && recommended.category === category.id
              const badge = isRecommended
                ? recommended.reason === 'unpracticed'
                  ? t('essayRecommended')
                  : t('essayWeakArea')
                : null
              const count = stat?.count ?? 0
              const average = stat?.averageScore
              const progress = maxCount <= 0 || count === 0
                ? 0
                : Math.max(4, Math.round((count / maxCount) * 100))

              return h(
                'article',
                {
                  className: isRecommended
                    ? 'tp-essayCategoryCard tp-essayCategoryCardRecommended'
                    : 'tp-essayCategoryCard',
                },
                h(
                  'div',
                  { className: 'tp-essayCategoryTop' },
                  h('span', { className: 'tp-essayCategoryCode' }, category.id),
                  badge === null ? null : h('span', { className: 'tp-essayCategoryBadge' }, badge),
                ),
                h('h3', { className: 'tp-essayCategoryTitle' }, category.zh),
                h('p', { className: 'tp-essayCategoryEn' }, category.en),
                h('p', { className: 'tp-essayCategoryDesc' }, t(category.descKey)),
                h(
                  'div',
                  { className: 'tp-essayCategoryStats' },
                  h(
                    'div',
                    null,
                    h('span', { className: 'tp-essayCategoryStatLabel' }, t('essayPracticeCount')),
                    h(
                      'strong',
                      { className: 'tp-essayCategoryStatValue' },
                      loading ? '…' : String(count),
                    ),
                  ),
                  h(
                    'div',
                    null,
                    h('span', { className: 'tp-essayCategoryStatLabel' }, t('essayAverageScore')),
                    h(
                      'strong',
                      { className: 'tp-essayCategoryStatValue' },
                      loading
                        ? '…'
                        : average === null || average === undefined
                          ? '—'
                          : `${average.toFixed(1)} / 20`,
                    ),
                  ),
                ),
                h(
                  'div',
                  { className: 'tp-essayCategoryProgress', 'aria-hidden': true },
                  h('span', { style: { width: `${progress}%` } }),
                ),
                h(
                  'button',
                  {
                    className: 'tp-btn tp-essayCategoryStart',
                    type: 'button',
                    onClick: () => onStart(category.id),
                  },
                  t('essayStartPractice'),
                ),
              )
            }

            function EssayView(props) {
              const { ctx, embedded = false, onSendSampleToTyping } = props
              const t = useT(ctx)
              const [topic, setTopic] = useState({
                status: 'idle',
                data: null,
                error: null,
                provider: null,
                model: null,
              })
              const [essay, setEssay] = useState('')
              const [score, setScore] = useState({
                status: 'idle',
                data: null,
                error: null,
                provider: null,
                model: null,
                recorded: null,
                recordError: null,
              })
              const [view, setView] = useState('board')
              const [selectedCategory, setSelectedCategory] = useState(null)
              const [stats, setStats] = useState({
                status: 'loading',
                data: null,
                error: null,
              })
              const [sample, setSample] = useState({
                status: 'idle',
                data: null,
                error: null,
              })
              const [sampleOpen, setSampleOpen] = useState(false)
              const [archiveId, setArchiveId] = useState(null)
              const topicAbortRef = useRef(null)
              const scoreAbortRef = useRef(null)
              const sampleAbortRef = useRef(null)

              const loadStats = useCallback(async () => {
                setStats((current) => ({
                  status: current.data === null ? 'loading' : current.status,
                  data: current.data,
                  error: null,
                }))
                try {
                  const data = await requestJson('/essay/stats')
                  if (data?.ok === false) throw new Error(data?.error?.message || t('essayStatsError'))
                  setStats({
                    status: 'ready',
                    data: assertEssayStatsPayload(data),
                    error: null,
                  })
                } catch (error) {
                  setStats((current) => ({
                    status: 'error',
                    data: current.data,
                    error: {
                      code: error?.code || 'ESSAY_STATS_FAILED',
                      message: error?.message || t('essayStatsError'),
                    },
                  }))
                }
              }, [t])

              const wordCount = essay.trim().length === 0
                ? 0
                : essay.trim().split(/\s+/).filter(Boolean).length
              const canSubmit = topic.status === 'ready'
                && essay.trim().length >= 20
                && score.status !== 'loading'
                && score.status !== 'ready'

              useEffect(() => {
                void loadStats()
              }, [loadStats])

              useEffect(() => () => {
                if (topicAbortRef.current !== null) topicAbortRef.current.abort()
                if (scoreAbortRef.current !== null) scoreAbortRef.current.abort()
                if (sampleAbortRef.current !== null) sampleAbortRef.current.abort()
              }, [])

              const generateTopic = useCallback(async (category = selectedCategory) => {
                if (!category) return
                const previousTopic = topicAbortRef.current
                if (previousTopic !== null) previousTopic.abort()
                if (scoreAbortRef.current !== null) scoreAbortRef.current.abort()
                if (sampleAbortRef.current !== null) sampleAbortRef.current.abort()
                setSample({ status: 'idle', data: null, error: null })
                setSampleOpen(false)
                setArchiveId(null)

                const controller = new AbortController()
                topicAbortRef.current = controller
                setTopic({ status: 'loading', data: null, error: null, provider: null, model: null })
                setScore({
                  status: 'idle',
                  data: null,
                  error: null,
                  provider: null,
                  model: null,
                  recorded: null,
                  recordError: null,
                })
                setEssay('')

                try {
                  const data = await requestJson('/essay/topic', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ category }),
                    signal: controller.signal,
                  })
                  if (controller.signal.aborted) return
                  const topicData = assertEssayTopicPayload(data?.topic)
                  setTopic({
                    status: 'ready',
                    data: topicData,
                    error: null,
                    provider: data?.provider || null,
                    model: data?.model || null,
                  })
                } catch (error) {
                  if (controller.signal.aborted || error?.name === 'AbortError') return
                  setTopic({
                    status: 'error',
                    data: null,
                    error: {
                      code: error?.code || 'ESSAY_TOPIC_FAILED',
                      message: error?.message || t('essayTopicError'),
                    },
                    provider: null,
                    model: null,
                  })
                } finally {
                  if (topicAbortRef.current === controller) topicAbortRef.current = null
                }
              }, [selectedCategory, t])

              const regenerateTopic = useCallback(() => {
                if (
                  (essay.trim().length > 0 || score.status === 'ready')
                  && !window.confirm(t('essayRegenerateConfirm'))
                ) {
                  return
                }
                void generateTopic(selectedCategory)
              }, [essay, score.status, generateTopic, selectedCategory, t])

              const startPractice = useCallback((category) => {
                setSelectedCategory(category)
                setView('practice')
                void generateTopic(category)
              }, [generateTopic])

              const returnToBoard = useCallback(() => {
                if (
                  essay.trim().length > 0
                  && score.status !== 'ready'
                  && !window.confirm(t('essayLeaveConfirm'))
                ) {
                  return
                }
                if (topicAbortRef.current !== null) topicAbortRef.current.abort()
                if (scoreAbortRef.current !== null) scoreAbortRef.current.abort()
                setView('board')
                void loadStats()
              }, [essay, score.status, loadStats, t])

              const generateSample = useCallback(async () => {
                if (topic.status !== 'ready' || !topic.data) return
                if (sampleAbortRef.current !== null) sampleAbortRef.current.abort()
                const controller = new AbortController()
                sampleAbortRef.current = controller
                setSampleOpen(true)
                setSample({ status: 'loading', data: null, error: null })
                try {
                  const data = await requestJson('/essay/sample', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                      topic_id: topic.data.topic_id,
                      topic_prompt: topic.data.topic_prompt,
                      category: selectedCategory,
                    }),
                    signal: controller.signal,
                  })
                  if (controller.signal.aborted) return
                  const nextSample = {
                    ...assertEssaySamplePayload(data?.sample),
                    strategy: typeof data?.strategy === 'string' ? data.strategy : '',
                  }
                  setSample({
                    status: 'ready',
                    data: nextSample,
                    error: null,
                  })
                  if (archiveId !== null) {
                    void requestJson('/essay/archive/attach-sample', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({
                        archive_id: archiveId,
                        sample_essay: nextSample.essay_text,
                        sample_translation: nextSample.translation,
                        sample_core_argument: nextSample.core_argument ?? '',
                        sample_highlights: nextSample.highlights,
                        sample_strategy: nextSample.strategy,
                      }),
                    }).catch(() => {})
                  }
                } catch (error) {
                  if (controller.signal.aborted || error?.name === 'AbortError') return
                  setSample({
                    status: 'error',
                    data: null,
                    error: {
                      code: error?.code || 'ESSAY_SAMPLE_FAILED',
                      message: error?.message || t('essaySampleError'),
                    },
                  })
                } finally {
                  if (sampleAbortRef.current === controller) sampleAbortRef.current = null
                }
              }, [topic.status, topic.data, selectedCategory, archiveId, t])

              const openSample = useCallback(() => {
                if (sample.status === 'ready' || sample.status === 'error') {
                  setSampleOpen(true)
                  return
                }
                void generateSample()
              }, [sample.status, generateSample])

              const importSample = useCallback((data) => {
                if (typeof onSendSampleToTyping !== 'function') return false
                const title = topic.data?.topic_id
                  ? `${t('essaySampleTypingTitle')} · ${topic.data.topic_id}`
                  : t('essaySampleTypingTitle')
                return onSendSampleToTyping({ title, text: data.essay_text })
              }, [onSendSampleToTyping, t, topic.data])

              const submitEssay = useCallback(async () => {
                if (topic.status !== 'ready' || essay.trim().length < 20 || !selectedCategory) return
                if (scoreAbortRef.current !== null) scoreAbortRef.current.abort()

                const controller = new AbortController()
                scoreAbortRef.current = controller
                setScore({
                  status: 'loading',
                  data: null,
                  error: null,
                  provider: null,
                  model: null,
                  recorded: null,
                  recordError: null,
                })

                try {
                  const data = await requestJson('/essay/score', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                      category: selectedCategory,
                      topic_prompt: topic.data.topic_prompt,
                      essay,
                      drawing_svg: topic.data?.drawing_svg ?? '',
                      sample_essay: sample.status === 'ready' ? sample.data?.essay_text ?? null : null,
                      sample_translation: sample.status === 'ready' ? sample.data?.translation ?? '' : '',
                      sample_core_argument: sample.status === 'ready' ? sample.data?.core_argument ?? '' : '',
                      sample_highlights: sample.status === 'ready' ? sample.data?.highlights ?? [] : [],
                      sample_strategy: sample.status === 'ready' ? sample.data?.strategy ?? '' : '',
                    }),
                    signal: controller.signal,
                  })
                  if (controller.signal.aborted) return
                  const scoreData = assertEssayScorePayload(data?.score)
                  setScore({
                    status: 'ready',
                    data: scoreData,
                    error: null,
                    provider: data?.provider || null,
                    model: data?.model || null,
                    recorded: data?.recorded === true,
                    recordError: data?.recordError || null,
                  })
                  setArchiveId(typeof data?.archive_id === 'string' ? data.archive_id : null)
                  if (data?.recorded === true) void loadStats()
                } catch (error) {
                  if (controller.signal.aborted || error?.name === 'AbortError') return
                  setScore({
                    status: 'error',
                    data: null,
                    error: {
                      code: error?.code || 'ESSAY_SCORE_FAILED',
                      message: error?.message || t('essayScoreError'),
                    },
                    provider: null,
                    model: null,
                    recorded: null,
                    recordError: null,
                  })
                } finally {
                  if (scoreAbortRef.current === controller) scoreAbortRef.current = null
                }
              }, [topic, essay, selectedCategory, sample, loadStats, t])

              function handleEssayChange(event) {
                setEssay(event.target.value)
                if (score.status !== 'idle') {
                  setScore({
                    status: 'idle',
                    data: null,
                    error: null,
                    provider: null,
                    model: null,
                    recorded: null,
                    recordError: null,
                  })
                }
              }

              const topicButtonLabel = topic.status === 'loading'
                ? t('essayGenerating')
                : topic.data
                  ? t('essayRegenerate')
                  : t('essayGenerate')

              const statsMap = new Map(
                (stats.data?.categories ?? []).map((item) => [item.category, item]),
              )
              const maxCount = Math.max(1, ...(stats.data?.categories ?? []).map((item) => item.count))
              const totalAttempts = stats.data?.totalAttempts ?? 0
              const overallAverage = totalAttempts === 0
                ? null
                : (
                    (stats.data.categories.reduce(
                      (sum, item) => sum + (item.averageScore ?? 0) * item.count,
                      0,
                    ) / totalAttempts).toFixed(1)
                  )
              const recommended = stats.data?.recommended ?? null

              if (view === 'archive') {
                return h(
                  'div',
                  {
                    className: embedded
                      ? 'tp-root tp-essayRoot tp-embeddedRoot'
                      : 'tp-root tp-essayRoot',
                  },
                  h(
                    'header',
                    { className: embedded ? 'tp-header tp-headerEmbedded' : 'tp-header' },
                    h(
                      'div',
                      { className: 'tp-headerActions' },
                      h(
                        'button',
                        {
                          className: 'tp-btn tp-essayBackButton',
                          type: 'button',
                          onClick: () => setView('board'),
                        },
                        t('essayBackToBoard'),
                      ),
                    ),
                  ),
                  h(EssayArchiveView, {
                    ctx,
                    onImportSample: (payload) => (
                      typeof onSendSampleToTyping === 'function'
                        ? onSendSampleToTyping(payload)
                        : false
                    ),
                  }),
                )
              }

              return h(
                'div',
                {
                  className: embedded
                    ? 'tp-root tp-essayRoot tp-embeddedRoot'
                    : 'tp-root tp-essayRoot',
                },
                h(
                  'header',
                  { className: embedded ? 'tp-header tp-headerEmbedded' : 'tp-header' },
                  embedded
                    ? null
                    : h(
                        'div',
                        { className: 'tp-heading' },
                        h('h1', { className: 'tp-title' }, t('essayTitle')),
                        h('p', { className: 'tp-subtitle' }, t('essaySubtitle')),
                      ),
                  h(
                    'div',
                    { className: 'tp-headerActions' },
                    view === 'board'
                      ? h(
                          React.Fragment,
                          null,
                          h(
                            'button',
                            {
                              className: 'tp-btn',
                              type: 'button',
                              onClick: () => setView('archive'),
                            },
                            t('essayArchiveEntry'),
                          ),
                          h(
                            'button',
                            {
                              className: 'tp-btn',
                              type: 'button',
                              disabled: stats.status === 'loading',
                              onClick: loadStats,
                            },
                            t('essayRefreshStats'),
                          ),
                        )
                      : view === 'archive'
                        ? h(
                            'button',
                            {
                              className: 'tp-btn tp-essayBackButton',
                              type: 'button',
                              onClick: () => setView('board'),
                            },
                            t('essayBackToBoard'),
                          )
                        : h(
                            React.Fragment,
                            null,
                            h(
                              'button',
                              {
                                className: 'tp-btn tp-essayBackButton',
                                type: 'button',
                                onClick: returnToBoard,
                              },
                              t('essayBackToBoard'),
                            ),
                            h(
                              'button',
                              {
                                className: 'tp-btn',
                                type: 'button',
                                disabled: topic.status === 'loading',
                                onClick: topic.data ? regenerateTopic : () => generateTopic(selectedCategory),
                              },
                              topicButtonLabel,
                            ),
                          ),
                  ),
                ),
                view === 'board'
                  ? h(
                      'div',
                      { className: 'tp-essayBoard' },
                      h(
                        'div',
                        { className: 'tp-essayBoardIntro' },
                        h('h2', { className: 'tp-essayBoardTitle' }, t('essayBoardTitle')),
                        h('p', { className: 'tp-essayBoardSubtitle' }, t('essayBoardSubtitle')),
                        stats.data === null
                          ? null
                          : h(
                              'p',
                              { className: 'tp-essayBoardSummary' },
                              `${t('essayTotalPractice')} ${totalAttempts} · ${t('essayOverallAverage')} ${overallAverage === null ? '—' : `${overallAverage} / 20`}`,
                            ),
                      ),
                      stats.status === 'error'
                        ? h(
                            'div',
                            { className: 'tp-alert' },
                            h(
                              'div',
                              { className: 'tp-alertText' },
                              h('div', null, stats.error?.message || t('essayStatsError')),
                            ),
                            h(
                              'button',
                              { className: 'tp-btn', type: 'button', onClick: loadStats },
                              t('essayStatsRetry'),
                            ),
                          )
                        : null,
                      stats.status === 'loading'
                        ? h('div', { className: 'tp-essayStatsLoading' }, t('essayStatsLoading'))
                        : null,
                      h(
                        'div',
                        { className: 'tp-essayCategoryGrid' },
                        ESSAY_CATEGORIES.map((category) => h(EssayCategoryCard, {
                          key: category.id,
                          category,
                          stat: statsMap.get(category.id) ?? null,
                          recommended,
                          maxCount,
                          loading: stats.status === 'loading',
                          t,
                          onStart: startPractice,
                        })),
                      ),
                    )
                  : h(
                      React.Fragment,
                      null,
                      selectedCategory !== null && ESSAY_CATEGORY_MAP[selectedCategory]
                        ? h(
                            'div',
                            {
                              className: 'tp-essayPracticeCategory',
                              'data-category': selectedCategory,
                            },
                            h('span', { className: 'tp-essayPracticeCategoryId' }, selectedCategory),
                            h(
                              'span',
                              null,
                              `${ESSAY_CATEGORY_MAP[selectedCategory].zh} · ${ESSAY_CATEGORY_MAP[selectedCategory].en}`,
                            ),
                          )
                        : null,
                      topic.status === 'error'
                  ? h(
                      'div',
                      { className: 'tp-alert' },
                      h(
                        'div',
                        { className: 'tp-alertText' },
                        h('div', null, topic.error?.message || t('essayTopicError')),
                        h('div', { className: 'tp-alertHint' }, t('essayErrorHint')),
                      ),
                      h(
                        'button',
                        { className: 'tp-btn', type: 'button', onClick: () => generateTopic(selectedCategory) },
                        t('essayRetryTopic'),
                      ),
                    )
                  : null,
                topic.status === 'idle'
                  ? h(
                      'div',
                      { className: 'tp-essayEmpty' },
                      h('div', { className: 'tp-essayEmptyIcon' }, '✎'),
                      h('h2', { className: 'tp-essayEmptyTitle' }, t('essayEmptyTitle')),
                      h('p', { className: 'tp-essayEmptyBody' }, t('essayEmptyBody')),
                      h(
                        'button',
                        { className: 'tp-btn', type: 'button', onClick: () => generateTopic(selectedCategory) },
                        t('essayGenerate'),
                      ),
                    )
                  : topic.status === 'loading'
                    ? h(
                        'div',
                        { className: 'tp-essayEmpty tp-essayLoading' },
                        h('div', { className: 'tp-quizSpinner' }),
                        h('div', { className: 'tp-quizLoadingText' }, t('essayGenerating')),
                        h('div', { className: 'tp-quizLoadingHint' }, t('essayTopicLoadingHint')),
                      )
                    : topic.status === 'ready' && topic.data
                      ? h(
                          'div',
                          { className: 'tp-essayGrid' },
                          h(
                            'div',
                            { className: 'tp-essayCol' },
                            h(
                              'section',
                              { className: 'tp-card tp-essayDrawingCard' },
                              h(
                                'div',
                                { className: 'tp-cardHead' },
                                h('h2', { className: 'tp-cardTitle' }, t('essayDrawingLabel')),
                                h('span', { className: 'tp-cardMeta' }, t('essayDrawingHint')),
                              ),
                              h(
                                'div',
                                { className: 'tp-essayDrawingBody' },
                                h('div', {
                                  className: 'tp-essayDrawingSvg',
                                  dangerouslySetInnerHTML: { __html: topic.data.drawing_svg },
                                }),
                              ),
                            ),
                            h(
                              'section',
                              { className: 'tp-card' },
                              h(
                                'div',
                                { className: 'tp-cardHead' },
                                h('h2', { className: 'tp-cardTitle' }, t('essayTopicLabel')),
                                h('span', { className: 'tp-cardMeta' }, topic.data.topic_id),
                              ),
                              h(
                                'div',
                                { className: 'tp-essayTopicBody' },
                                h('p', { className: 'tp-essayPrompt' }, topic.data.topic_prompt),
                              ),
                            ),
                            h(
                              'section',
                              { className: 'tp-card' },
                              h(
                                'div',
                                { className: 'tp-cardHead' },
                                h('h2', { className: 'tp-cardTitle' }, t('essayVocabularyLabel')),
                                h('span', { className: 'tp-cardMeta' }, String(topic.data.related_vocabulary.length)),
                              ),
                              h(
                                'div',
                                { className: 'tp-essayMaterialBody tp-essayScroll tp-essayVocabScroll' },
                                h(
                                  'div',
                                  { className: 'tp-essayVocabGrid' },
                                  topic.data.related_vocabulary.map((item, index) => h(
                                    'div',
                                    { className: 'tp-essayVocab', key: index },
                                    h('span', { className: 'tp-essayWord' }, item.word),
                                    h('span', { className: 'tp-essayMeaning' }, item.meaning),
                                  )),
                                ),
                              ),
                            ),
                            h(
                              'section',
                              { className: 'tp-card' },
                              h(
                                'div',
                                { className: 'tp-cardHead' },
                                h('h2', { className: 'tp-cardTitle' }, t('essayExpressionsLabel')),
                                h('span', { className: 'tp-cardMeta' }, String(topic.data.useful_expressions.length)),
                              ),
                              h(
                                'div',
                                { className: 'tp-essayMaterialBody tp-essayScroll tp-essayExpressionScroll' },
                                h(
                                  'div',
                                  { className: 'tp-essayExpressionList' },
                                  topic.data.useful_expressions.map((item, index) => h(
                                    'div',
                                    { className: 'tp-essayExpression', key: index },
                                    h(
                                      'div',
                                      { className: 'tp-essayExpressionHead' },
                                      h('span', { className: 'tp-essayExpressionText' }, item.expression),
                                      h(
                                        'span',
                                        { className: 'tp-essayPosition' },
                                        essayPositionLabel(t, item.position),
                                      ),
                                    ),
                                    h('p', { className: 'tp-essayExpressionMeaning' }, item.meaning),
                                  )),
                                ),
                              ),
                            ),
                            h(
                              'section',
                              { className: 'tp-card' },
                              h(
                                'div',
                                { className: 'tp-cardHead' },
                                h('h2', { className: 'tp-cardTitle' }, t('essayBackgroundLabel')),
                                h('span', { className: 'tp-cardMeta' }, String(topic.data.cultural_background.length)),
                              ),
                              h(
                                'div',
                                { className: 'tp-essayMaterialBody tp-essayScroll tp-essayBackgroundScroll' },
                                h(
                                  'ul',
                                  { className: 'tp-essayBackgroundList' },
                                  topic.data.cultural_background.map((sentence, index) => h(
                                    'li',
                                    { key: index },
                                    sentence,
                                  )),
                                ),
                              ),
                            ),
                          ),
                          h(
                            'div',
                            { className: 'tp-essayCol' },
                            h(
                              'section',
                              { className: 'tp-card tp-essayWriteCard' },
                              h(
                                'div',
                                { className: 'tp-cardHead' },
                                h('h2', { className: 'tp-cardTitle' }, t('essayWritingLabel')),
                                h('span', { className: 'tp-cardMeta' }, t('essayWordTarget')),
                              ),
                              h(
                                'div',
                                { className: 'tp-essayWriteBody' },
                                h('textarea', {
                                  className: 'tp-essayTextarea',
                                  value: essay,
                                  onChange: handleEssayChange,
                                  placeholder: t('essayPlaceholder'),
                                  spellCheck: false,
                                  autoCapitalize: 'off',
                                  autoCorrect: 'off',
                                  autoComplete: 'off',
                                  maxLength: 12000,
                                  'aria-label': t('essayWritingLabel'),
                                }),
                                h(
                                  'div',
                                  { className: 'tp-essayWriteFooter' },
                                  h(
                                    'div',
                                    { className: 'tp-essayWordCount' },
                                    h('strong', null, String(wordCount)),
                                    ` ${t('essayWordUnit')} · ${t('essayWordTarget')}`,
                                  ),
                                  h(
                                    'button',
                                    {
                                      className: 'tp-btn tp-essaySampleBtn',
                                      type: 'button',
                                      disabled: topic.status !== 'ready' || sample.status === 'loading',
                                      onClick: openSample,
                                    },
                                    sample.status === 'loading'
                                      ? t('essaySampleGeneratingShort')
                                      : t('essaySampleButton'),
                                  ),
                                  h(
                                    'button',
                                    {
                                      className: 'tp-btn',
                                      type: 'button',
                                      disabled: !canSubmit,
                                      title: canSubmit ? undefined : t('essayScoreNeedText'),
                                      onClick: submitEssay,
                                    },
                                    score.status === 'loading' ? t('essayScoring') : t('essaySubmit'),
                                  ),
                                ),
                                h('div', { className: 'tp-essayHint' }, t('essayWritingHint')),
                              ),
                            ),
                            h(
                              'section',
                              { className: 'tp-card tp-essayScoreCard' },
                              h(
                                'div',
                                { className: 'tp-cardHead' },
                                h('h2', { className: 'tp-cardTitle' }, t('essayResultTitle')),
                                score.status === 'ready'
                                  ? h('span', { className: 'tp-cardMeta' }, `${score.data.total_score} / 20`)
                                  : null,
                              ),
                              h(
                                'div',
                                { className: 'tp-essayScoreBody' },
                                h(EssayScorePanel, {
                                  score,
                                  t,
                                  onRetry: submitEssay,
                                  canRetry: canSubmit,
                                }),
                              ),
                            ),
                          ),
                        )
                      : null,
                    ),
                sampleOpen
                  ? h(EssaySampleModal, {
                      t,
                      state: sample,
                      onClose: () => setSampleOpen(false),
                      onRetry: generateSample,
                      onImport: importSample,
                    })
                  : null,
              )
            }

        module.exports = { EssayWorkspace: EssayView }

      },
      "favorites/index.js": function (module, exports, require) {
        const {
          React, h, useCallback, useEffect, useMemo, useState,
          requestJson, useT,
        } = require('../shared.js')

            function formatStamp(value) {
              const date = new Date(value)
              if (Number.isNaN(date.getTime())) return ''
              const pad = (input) => String(input).padStart(2, '0')
              return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
            }

            function normalizeType(item) {
              return item.type === 'word' ? 'vocabulary' : item.type
            }

            const FAVORITE_CATEGORIES = [
              '社会热点',
              '科技与生活',
              '文化与教育',
              '人生哲理',
              '经济与商业',
              '环境与健康',
            ]

            function parseTopicEntry(topic) {
              if (topic !== null && typeof topic === 'object' && !Array.isArray(topic)) {
                const category = typeof topic.category === 'string' ? topic.category.trim() : ''
                const subcategory = typeof topic.subcategory === 'string' ? topic.subcategory.trim() : ''
                return category.length > 0 && subcategory.length > 0
                  ? { category, subcategory }
                  : null
              }
              const parts = String(topic ?? '').split('/').map((part) => part.trim()).filter(Boolean)
              if (parts.length === 0) return null
              return parts.length === 1
                ? { category: '社会热点', subcategory: parts[0] }
                : { category: parts[0], subcategory: parts.slice(1).join('/') }
            }

            function itemTopics(item) {
              if (!Array.isArray(item.topics)) return []
              const seen = new Set()
              return item.topics.map(parseTopicEntry).filter((topic) => {
                if (topic === null) return false
                const key = `${topic.category}\u0000${topic.subcategory}`
                if (seen.has(key)) return false
                seen.add(key)
                return true
              })
            }

            function FavoritesView(props) {
              const { ctx, refreshToken = 0, onClose, onSendToTyping } = props
              const t = useT(ctx)
              const [state, setState] = useState({ loading: true, error: null, items: [] })
              const [activeType, setActiveType] = useState('vocabulary')
              const [tagMajor, setTagMajor] = useState(null)
              const [tagMinor, setTagMinor] = useState(null)
              const [deleting, setDeleting] = useState({})
              const [noteEditing, setNoteEditing] = useState(null)
              const [noteDraft, setNoteDraft] = useState('')
              const [savingNote, setSavingNote] = useState(null)

              const reload = useCallback(async () => {
                setState((current) => ({ ...current, loading: true, error: null }))
                try {
                  const data = await requestJson('/favorites', { method: 'GET' })
                  setState({
                    loading: false,
                    error: null,
                    items: Array.isArray(data?.items) ? data.items : [],
                  })
                } catch (error) {
                  setState({
                    loading: false,
                    error: error?.code === 'STORAGE_UNAVAILABLE'
                      ? t('favoritesStorageError')
                      : (error?.message || t('favoritesStorageError')),
                    items: [],
                  })
                }
              }, [t])

              useEffect(() => {
                void reload()
              }, [reload, refreshToken])

              const remove = useCallback(async (item) => {
                if (!window.confirm(t('favoritesDeleteConfirm'))) return
                setDeleting((current) => ({ ...current, [item.id]: true }))
                try {
                  await requestJson('/favorites/delete', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ id: item.id }),
                  })
                  setState((current) => ({
                    ...current,
                    items: current.items.filter((entry) => entry.id !== item.id),
                  }))
                } catch (error) {
                  setState((current) => ({ ...current, error: error?.message || t('favoriteToastFailed') }))
                } finally {
                  setDeleting((current) => {
                    const next = { ...current }
                    delete next[item.id]
                    return next
                  })
                }
              }, [t])

              const saveNote = useCallback(async (item) => {
                setSavingNote(item.id)
                try {
                  const data = await requestJson('/favorites/update', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ id: item.id, note: noteDraft }),
                  })
                  const nextItem = data?.item
                  setState((current) => ({
                    ...current,
                    items: current.items.map((entry) => (
                      entry.id === item.id
                        ? { ...entry, note: typeof nextItem?.note === 'string' ? nextItem.note : noteDraft.trim() }
                        : entry
                    )),
                  }))
                  setNoteEditing(null)
                  setNoteDraft('')
                } catch (error) {
                  setState((current) => ({ ...current, error: error?.message || t('favoritesNoteFailed') }))
                } finally {
                  setSavingNote(null)
                }
              }, [noteDraft, t])

              const counts = useMemo(() => {
                const vocabulary = state.items.filter((item) => normalizeType(item) === 'vocabulary').length
                const sentence = state.items.filter((item) => normalizeType(item) === 'sentence').length
                return { vocabulary, sentence }
              }, [state.items])

              const typeItems = useMemo(
                () => state.items.filter((item) => normalizeType(item) === activeType),
                [state.items, activeType],
              )

              const tagTree = useMemo(() => {
                const majors = new Map()
                for (const name of FAVORITE_CATEGORIES) {
                  majors.set(name, { name, count: 0, minors: new Map() })
                }

                const ensureTopic = (topic) => {
                  let major = majors.get(topic.category)
                  if (major === undefined) {
                    major = { name: topic.category, count: 0, minors: new Map() }
                    majors.set(topic.category, major)
                  }
                  const path = `${topic.category}/${topic.subcategory}`
                  if (!major.minors.has(path)) {
                    major.minors.set(path, { name: topic.subcategory, path, count: 0 })
                  }
                  return major
                }

                for (const item of state.items) {
                  for (const topic of itemTopics(item)) ensureTopic(topic)
                }

                for (const item of typeItems) {
                  const seenMajor = new Set()
                  const seenMinor = new Set()
                  for (const topic of itemTopics(item)) {
                    const major = ensureTopic(topic)
                    if (!seenMajor.has(major.name)) {
                      major.count += 1
                      seenMajor.add(major.name)
                    }
                    const path = `${topic.category}/${topic.subcategory}`
                    const minor = major.minors.get(path)
                    if (!seenMinor.has(path)) {
                      minor.count += 1
                      seenMinor.add(path)
                    }
                  }
                }

                return Array.from(majors.values()).map((major) => ({
                  ...major,
                  minors: new Map(
                    Array.from(major.minors.values())
                      .sort((left, right) => (
                        right.count - left.count || left.name.localeCompare(right.name)
                      ))
                      .map((minor) => [minor.path, minor]),
                  ),
                }))
              }, [state.items, typeItems])

              const activeMajor = tagMajor === null
                ? null
                : tagTree.find((entry) => entry.name === tagMajor) ?? null

              useEffect(() => {
                if (tagMajor === null) {
                  if (tagMinor !== null) setTagMinor(null)
                  return
                }
                if (activeMajor === null) {
                  setTagMajor(null)
                  setTagMinor(null)
                  return
                }
                if (tagMinor !== null && !activeMajor.minors.has(`${tagMajor}/${tagMinor}`)) {
                  setTagMinor(null)
                }
              }, [tagMajor, tagMinor, activeMajor])

              const visibleItems = useMemo(() => (
                tagMajor === null
                  ? typeItems
                  : typeItems.filter((item) => itemTopics(item).some((topic) => (
                      topic.category === tagMajor
                      && (tagMinor === null || topic.subcategory === tagMinor)
                    )))
              ), [typeItems, tagMajor, tagMinor])

              const openNote = (item) => {
                setNoteEditing(item.id)
                setNoteDraft(typeof item.note === 'string' ? item.note : '')
              }

              const cancelNote = () => {
                setNoteEditing(null)
                setNoteDraft('')
              }

              const follow = (item) => {
                if (typeof onSendToTyping !== 'function') return
                const type = normalizeType(item)
                const text = type === 'vocabulary' && typeof item.source === 'string' && item.source.trim().length > 0
                  ? item.source.trim()
                  : item.text
                const accepted = onSendToTyping({
                  title: type === 'vocabulary'
                    ? `${t('favoritesFollowWord')} · ${item.text}`
                    : t('favoritesFollowSentence'),
                  text,
                })
                if (accepted && typeof onClose === 'function') onClose()
              }

              const renderPhrases = (item) => {
                const phrases = Array.isArray(item.embeddedPhrases) ? item.embeddedPhrases : []
                if (phrases.length === 0) return null
                return h(
                  'details',
                  { className: 'tp-favPhrases' },
                  h('summary', null, `${t('favoritesEmbeddedPhrases')} · ${phrases.length}`),
                  h(
                    'ul',
                    { className: 'tp-favPhraseList' },
                    phrases.map((phrase, index) => h(
                      'li',
                      { key: index },
                      h('strong', null, phrase.phrase),
                      h('span', null, phrase.meaning),
                    )),
                  ),
                )
              }

              const renderItem = (item) => {
                const type = normalizeType(item)
                const topics = itemTopics(item)
                const note = typeof item.note === 'string' ? item.note.trim() : ''
                return h(
                  'article',
                  { className: 'tp-favItem', key: item.id },
                  h(
                    'div',
                    { className: 'tp-favItemHead' },
                    h(
                      'span',
                      { className: type === 'vocabulary' ? 'tp-favType tp-favTypeWord' : 'tp-favType tp-favTypeSentence' },
                      type === 'vocabulary' ? t('favoriteTypeVocabulary') : t('favoriteTypeSentence'),
                    ),
                    type === 'vocabulary' && item.isWritingVocab === true
                      ? h('span', { className: 'tp-favWriting' }, t('favoritesWritingVocab'))
                      : null,
                    h('span', { className: 'tp-favMeta' }, formatStamp(item.createdAt)),
                    h(
                      'div',
                      { className: 'tp-favItemActions' },
                      typeof onSendToTyping === 'function'
                        ? h(
                            'button',
                            {
                              className: 'tp-favPlay',
                              type: 'button',
                              onClick: () => follow(item),
                            },
                            type === 'vocabulary' ? `⌨️ ${t('favoritesFollowWord')}` : `⌨️ ${t('favoritesFollowSentence')}`,
                          )
                        : null,
                      h(
                        'button',
                        {
                          className: 'tp-favDel',
                          type: 'button',
                          disabled: deleting[item.id] === true,
                          onClick: () => { void remove(item) },
                        },
                        t('favoritesDelete'),
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'tp-favTextRow' },
                    h('p', { className: 'tp-favText' }, item.text),
                    type === 'vocabulary' && item.pos ? h('span', { className: 'tp-favPos' }, item.pos) : null,
                  ),
                  item.translation ? h('p', { className: 'tp-favZh' }, item.translation) : null,
                  type === 'sentence' && item.analysis
                    ? h('p', { className: 'tp-favAnalysis' }, item.analysis)
                    : null,
                  renderPhrases(item),
                  topics.length > 0
                    ? h(
                        'div',
                        { className: 'tp-favTags' },
                        topics.map((topic) => h(
                          'span',
                          {
                            className: 'tp-favTag',
                            key: `${topic.category}/${topic.subcategory}`,
                          },
                          `${topic.category} / ${topic.subcategory}`,
                        )),
                      )
                    : null,
                  item.source ? h('p', { className: 'tp-favSource' }, `${t('favoritesSource')} · ${item.source}`) : null,
                  noteEditing === item.id
                    ? h(
                        'div',
                        { className: 'tp-favNoteEditor' },
                        h('textarea', {
                          className: 'tp-favNoteInput',
                          value: noteDraft,
                          onChange: (event) => setNoteDraft(event.target.value),
                          placeholder: t('favoritesNotePlaceholder'),
                          maxLength: 4000,
                          rows: 3,
                        }),
                        h(
                          'div',
                          { className: 'tp-favNoteActions' },
                          h(
                            'button',
                            {
                              className: 'tp-btn tp-btnSmall',
                              type: 'button',
                              disabled: savingNote === item.id,
                              onClick: () => { void saveNote(item) },
                            },
                            savingNote === item.id ? t('favoritesNoteSaving') : t('favoritesNoteSave'),
                          ),
                          h(
                            'button',
                            { className: 'tp-btn tp-btnSmall', type: 'button', onClick: cancelNote },
                            t('favoritesNoteCancel'),
                          ),
                        ),
                      )
                    : h(
                        React.Fragment,
                        null,
                        note.length > 0
                          ? h('p', { className: 'tp-favNote' }, note)
                          : null,
                        h(
                          'button',
                          {
                            className: 'tp-favNoteBtn',
                            type: 'button',
                            onClick: () => openNote(item),
                          },
                          note.length > 0 ? t('favoritesNoteEdit') : t('favoritesNoteAdd'),
                        ),
                      ),
                )
              }

              const typeTab = (value, label, count) => h(
                'button',
                {
                  key: value,
                  className: activeType === value ? 'tp-favTypeTab tp-favTypeTabActive' : 'tp-favTypeTab',
                  type: 'button',
                  onClick: () => {
                    setActiveType(value)
                    setNoteEditing(null)
                  },
                },
                `${label} ${count}`,
              )

              return h(
                'div',
                { className: 'tp-root tp-favRoot' },
                h(
                  'header',
                  { className: 'tp-header' },
                  h(
                    'div',
                    { className: 'tp-heading' },
                    h('h1', { className: 'tp-title' }, t('favoritesTitle')),
                    h('p', { className: 'tp-subtitle' }, t('favoritesSubtitle')),
                  ),
                  h(
                    'div',
                    { className: 'tp-headerActions' },
                    h('button', { className: 'tp-btn', type: 'button', onClick: () => { void reload() } }, t('favoritesRefresh')),
                    onClose === undefined
                      ? null
                      : h(
                          'button',
                          {
                            className: 'tp-favClose',
                            type: 'button',
                            'aria-label': t('favoritesClose'),
                            title: t('favoritesClose'),
                            onClick: onClose,
                          },
                          '×',
                        ),
                  ),
                ),
                h(
                  'div',
                  { className: 'tp-favTypeTabs' },
                  typeTab('vocabulary', t('favoriteTypeVocabulary'), counts.vocabulary),
                  typeTab('sentence', t('favoriteTypeSentence'), counts.sentence),
                ),
                tagTree.length > 0
                  ? h(
                      'div',
                      { className: 'tp-favTagCloud' },
                      h(
                        'div',
                        { className: 'tp-favTagCloudHead' },
                        h('span', null, t('favoritesTagFilter')),
                        tagMajor === null
                          ? null
                          : h(
                              'button',
                              {
                                className: 'tp-favTagClear',
                                type: 'button',
                                onClick: () => {
                                  setTagMajor(null)
                                  setTagMinor(null)
                                },
                              },
                              t('favoritesTagAll'),
                            ),
                      ),
                      h(
                        'div',
                        { className: 'tp-favTagList' },
                        h(
                          'button',
                          {
                            className: tagMajor === null ? 'tp-favTagChip tp-favTagChipActive' : 'tp-favTagChip',
                            type: 'button',
                            onClick: () => {
                              setTagMajor(null)
                              setTagMinor(null)
                            },
                          },
                          t('favoritesTagAllShort'),
                        ),
                        tagTree.map((entry) => h(
                          'button',
                          {
                            key: entry.name,
                            className: tagMajor === entry.name ? 'tp-favTagChip tp-favTagChipActive' : 'tp-favTagChip',
                            type: 'button',
                            onClick: () => {
                              if (tagMajor === entry.name) {
                                setTagMajor(null)
                                setTagMinor(null)
                              } else {
                                setTagMajor(entry.name)
                                setTagMinor(null)
                              }
                            },
                          },
                          `${entry.name} ${entry.count}`,
                        )),
                      ),
                      activeMajor !== null && activeMajor.minors.size > 0
                        ? h(
                            'div',
                            { className: 'tp-favTagSubList' },
                            h(
                              'button',
                              {
                                className: tagMinor === null
                                  ? 'tp-favTagChip tp-favTagChipActive'
                                  : 'tp-favTagChip',
                                type: 'button',
                                onClick: () => setTagMinor(null),
                              },
                              `${activeMajor.name} · ${t('favoritesTagAllShort')}`,
                            ),
                            Array.from(activeMajor.minors.values()).map((minor) => h(
                              'button',
                              {
                                key: minor.path,
                                className: tagMinor === minor.name
                                  ? 'tp-favTagChip tp-favTagChipActive'
                                  : 'tp-favTagChip',
                                type: 'button',
                                onClick: () => setTagMinor((current) => (
                                  current === minor.name ? null : minor.name
                                )),
                              },
                              `${minor.name} ${minor.count}`,
                            )),
                          )
                        : null,
                    )
                  : null,
                state.error !== null
                  ? h('div', { className: 'tp-alert' }, state.error)
                  : null,
                h(
                  'div',
                  { className: 'tp-favList' },
                  state.loading && state.items.length === 0
                    ? h('div', { className: 'tp-favState' }, t('favoritesLoading'))
                    : state.items.length === 0
                      ? h('div', { className: 'tp-favState' }, t('favoritesEmpty'))
                      : visibleItems.length === 0
                        ? h(
                            'div',
                            { className: 'tp-favState' },
                            tagMajor === null ? t('favoritesEmpty') : t('favoritesTagEmpty'),
                          )
                        : visibleItems.map(renderItem),
                ),
              )
            }

            function FavoritesDrawer(props) {
              const { ctx, open, onClose, refreshToken, onSendToTyping } = props
              const t = useT(ctx)

              useEffect(() => {
                if (!open) return undefined
                const onKeyDown = (event) => {
                  if (event.key === 'Escape') onClose()
                }
                window.addEventListener('keydown', onKeyDown)
                return () => window.removeEventListener('keydown', onKeyDown)
              }, [open, onClose])

              if (!open) return null

              return h(
                'div',
                { className: 'tp-favDrawerLayer', onMouseUp: (event) => event.stopPropagation() },
                h('div', { className: 'tp-favDrawerBackdrop', onClick: onClose, 'aria-hidden': true }),
                h(
                  'section',
                  {
                    className: 'tp-favDrawerPanel',
                    role: 'dialog',
                    'aria-modal': 'true',
                    'aria-label': t('favoritesTitle'),
                  },
                  h(FavoritesView, { ctx, refreshToken, onClose, onSendToTyping }),
                ),
              )
            }

        module.exports = { FavoritesPanel: FavoritesView, FavoritesDrawer }

      },
      "glass-background.js": function (module, exports, require) {
        const { React, h, useEffect, useRef, useState } = require('./shared.js')

        const WALLPAPER_KEY = 'typing-practice:glass-wallpaper'
        const DEFAULT_WALLPAPER = '/dsh-liquid-glass/assets/liquid-glass-deepwater.b209a409aea86fd6.jpg'
        const MAX_FILE_BYTES = 8 * 1024 * 1024
        const MAX_DATA_URL_CHARS = 3.5 * 1024 * 1024

        function readStoredWallpaper() {
          try {
            const raw = window.localStorage.getItem(WALLPAPER_KEY)
            if (raw === null) return null
            const value = JSON.parse(raw)
            if (
              typeof value?.dataUrl === 'string'
              && value.dataUrl.startsWith('data:image/')
              && value.dataUrl.length <= MAX_DATA_URL_CHARS
            ) {
              return {
                dataUrl: value.dataUrl,
                name: typeof value.name === 'string' ? value.name : 'wallpaper',
              }
            }
          } catch {
            // A broken or oversized record falls back to the default wallpaper.
          }
          return null
        }

        function saveStoredWallpaper(value) {
          try {
            window.localStorage.setItem(WALLPAPER_KEY, JSON.stringify(value))
            return true
          } catch {
            return false
          }
        }

        function clearStoredWallpaper() {
          try {
            window.localStorage.removeItem(WALLPAPER_KEY)
          } catch {
            // Removing a missing record is not an error.
          }
        }

        function imageFromFile(file) {
          return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file)
            const image = new Image()
            image.onload = () => {
              URL.revokeObjectURL(url)
              resolve(image)
            }
            image.onerror = () => {
              URL.revokeObjectURL(url)
              reject(new Error('image-decode-failed'))
            }
            image.src = url
          })
        }

        async function compressWallpaper(file) {
          if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            throw new Error('backgroundUnsupported')
          }
          if (file.size > MAX_FILE_BYTES) {
            throw new Error('backgroundTooLarge')
          }

          const image = await imageFromFile(file)
          const maxEdge = 1800
          const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight))
          const width = Math.max(1, Math.round(image.naturalWidth * scale))
          const height = Math.max(1, Math.round(image.naturalHeight * scale))
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const context = canvas.getContext('2d')
          if (context === null) throw new Error('backgroundEncodeFailed')
          context.drawImage(image, 0, 0, width, height)

          let dataUrl = canvas.toDataURL('image/webp', 0.82)
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.84)
          }
          if (dataUrl.length > MAX_DATA_URL_CHARS) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.62)
          }
          if (dataUrl.length > MAX_DATA_URL_CHARS) {
            throw new Error('backgroundTooLarge')
          }
          return dataUrl
        }

        const BACKGROUND_CSS = `
          .tp-bgLayer {
            position: fixed;
            inset: 0;
            z-index: 130;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
          }
          .tp-bgBackdrop {
            position: absolute;
            inset: 0;
            background: rgba(2, 6, 14, 0.58);
            backdrop-filter: blur(4px);
          }
          .tp-bgCard {
            position: relative;
            z-index: 1;
            width: min(620px, 100%);
            max-height: calc(100vh - 40px);
            overflow: auto;
            box-sizing: border-box;
            padding: 22px;
            border: 1px solid rgba(255, 255, 255, 0.28);
            border-radius: 18px;
            background: linear-gradient(145deg, rgba(28, 43, 64, 0.96), rgba(10, 18, 32, 0.94));
            color: #f2f6ff;
            box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
          }
          .tp-bgClose {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 28px;
            height: 28px;
            border: 1px solid rgba(255, 255, 255, 0.24);
            border-radius: 8px;
            background: transparent;
            color: rgba(240, 246, 255, 0.72);
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
          }
          .tp-bgHeading {
            margin: 0;
            padding-right: 34px;
            font-size: 20px;
            line-height: 1.3;
            font-weight: 650;
          }
          .tp-bgSubtitle {
            margin: 6px 0 0;
            color: rgba(230, 239, 255, 0.66);
            font-size: 12.5px;
            line-height: 1.65;
          }
          .tp-bgPreview {
            position: relative;
            height: 220px;
            margin-top: 16px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.20);
            border-radius: 12px;
            background:
              radial-gradient(120% 90% at 10% 0%, rgba(95, 145, 220, 0.24), transparent 55%),
              #0b1423;
          }
          .tp-bgPreviewImage {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
          }
          .tp-bgPreviewLabel {
            position: absolute;
            left: 12px;
            bottom: 10px;
            padding: 4px 8px;
            border-radius: 999px;
            background: rgba(2, 8, 18, 0.56);
            color: rgba(242, 247, 255, 0.82);
            font-size: 11px;
            line-height: 1.4;
          }
          .tp-bgDrop {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-height: 76px;
            margin-top: 10px;
            padding: 12px;
            border: 1px dashed rgba(255, 255, 255, 0.28);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.045);
            color: rgba(230, 239, 255, 0.72);
            font-size: 12px;
            text-align: center;
            cursor: pointer;
          }
          .tp-bgDrop:hover {
            border-color: rgba(142, 197, 255, 0.65);
            color: #f2f6ff;
          }
          .tp-bgError {
            margin: 10px 0 0;
            color: #ff9a9a;
            font-size: 12px;
            line-height: 1.6;
          }
          .tp-bgActions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
          }
          .tp-bgBtn {
            padding: 8px 13px;
            border: 1px solid rgba(255, 255, 255, 0.24);
            border-radius: 9px;
            background: rgba(255, 255, 255, 0.08);
            color: #f2f6ff;
            font: inherit;
            font-size: 12px;
            cursor: pointer;
          }
          .tp-bgBtn:hover:not(:disabled) {
            border-color: rgba(142, 197, 255, 0.70);
            background: rgba(255, 255, 255, 0.14);
          }
          .tp-bgBtnPrimary {
            border-color: transparent;
            background: #8ec5ff;
            color: #08111f;
            font-weight: 650;
          }
          .tp-bgBtnPrimary:hover:not(:disabled) {
            background: #aad8ff;
          }
          .tp-bgBtn:disabled {
            opacity: .45;
            cursor: not-allowed;
          }
          .tp-bgHint {
            margin-top: 8px;
            color: rgba(230, 239, 255, 0.50);
            font-size: 11px;
            line-height: 1.55;
          }
          @media (max-width: 620px) {
            .tp-bgLayer { padding: 10px; }
            .tp-bgCard { padding: 18px 16px; }
            .tp-bgPreview { height: 180px; }
          }
        `

        function GlassBackgroundModal(props) {
          const { t, current, onApply, onRemove, onClose } = props
          const inputRef = useRef(null)
          const [preview, setPreview] = useState(current?.dataUrl ?? null)
          const [name, setName] = useState(current?.name ?? '')
          const [busy, setBusy] = useState(false)
          const [error, setError] = useState('')

          useEffect(() => {
            const onKeyDown = (event) => {
              if (event.key === 'Escape' && !busy) onClose()
            }
            window.addEventListener('keydown', onKeyDown)
            return () => window.removeEventListener('keydown', onKeyDown)
          }, [busy, onClose])

          async function handleFile(file) {
            if (file === null) return
            setError('')
            setBusy(true)
            try {
              const dataUrl = await compressWallpaper(file)
              setPreview(dataUrl)
              setName(file.name)
            } catch (failure) {
              const code = failure?.message
              setError(
                code === 'backgroundUnsupported'
                  ? t('backgroundUnsupported')
                  : code === 'backgroundTooLarge'
                    ? t('backgroundTooLarge')
                    : t('backgroundReadFailed'),
              )
            } finally {
              setBusy(false)
            }
          }

          function handleDrop(event) {
            event.preventDefault()
            if (!busy) void handleFile(event.dataTransfer?.files?.[0] ?? null)
          }

          function apply() {
            if (preview === null || busy) return
            setBusy(true)
            setError('')
            try {
              onApply({ dataUrl: preview, name })
            } catch (failure) {
              setError(failure?.message || t('backgroundSaveFailed'))
              setBusy(false)
            }
          }

          function remove() {
            if (busy) return
            onRemove()
            onClose()
          }

          return h(
            'div',
            {
              className: 'tp-bgLayer',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': t('backgroundTitle'),
              onClick: () => { if (!busy) onClose() },
            },
            h('div', { className: 'tp-bgBackdrop', 'aria-hidden': true }),
            h(
              'section',
              {
                className: 'tp-bgCard',
                onClick: (event) => event.stopPropagation(),
              },
              h('style', null, BACKGROUND_CSS),
              h(
                'button',
                {
                  className: 'tp-bgClose',
                  type: 'button',
                  'aria-label': t('backgroundClose'),
                  title: t('backgroundClose'),
                  disabled: busy,
                  onClick: onClose,
                },
                '×',
              ),
              h('h2', { className: 'tp-bgHeading' }, t('backgroundTitle')),
              h('p', { className: 'tp-bgSubtitle' }, t('backgroundSubtitle')),
              h(
                'div',
                { className: 'tp-bgPreview' },
                preview === null
                  ? null
                  : h('img', {
                      className: 'tp-bgPreviewImage',
                      src: preview,
                      alt: name || t('backgroundPreview'),
                    }),
                h(
                  'span',
                  { className: 'tp-bgPreviewLabel' },
                  preview === null ? t('backgroundDefault') : (name || t('backgroundPreview')),
                ),
              ),
              h(
                'label',
                {
                  className: 'tp-bgDrop',
                  onDragOver: (event) => event.preventDefault(),
                  onDrop: handleDrop,
                },
                h(
                  'span',
                  null,
                  busy ? t('backgroundProcessing') : t('backgroundDrop'),
                ),
                h('span', null, t('backgroundFormats')),
                h('input', {
                  ref: inputRef,
                  type: 'file',
                  accept: 'image/png,image/jpeg,image/webp',
                  style: { display: 'none' },
                  disabled: busy,
                  onChange: (event) => {
                    const file = event.target.files?.[0] ?? null
                    event.target.value = ''
                    void handleFile(file)
                  },
                }),
              ),
              h('div', { className: 'tp-bgHint' }, t('backgroundHint')),
              error === '' ? null : h('p', { className: 'tp-bgError' }, error),
              h(
                'div',
                { className: 'tp-bgActions' },
                h(
                  'button',
                  {
                    className: 'tp-bgBtn',
                    type: 'button',
                    disabled: busy,
                    onClick: remove,
                  },
                  t('backgroundRemove'),
                ),
                h(
                  'button',
                  {
                    className: 'tp-bgBtn tp-bgBtnPrimary',
                    type: 'button',
                    disabled: busy || preview === null,
                    onClick: apply,
                  },
                  busy ? t('backgroundProcessing') : t('backgroundApply'),
                ),
              ),
            ),
          )
        }

        module.exports = {
          DEFAULT_WALLPAPER,
          GlassBackgroundModal,
          clearStoredWallpaper,
          readStoredWallpaper,
          saveStoredWallpaper,
        }

      },
      "icons.js": function (module, exports, require) {
        const { h } = require('./shared.js')

            function TypingPracticeIcon(props) {
              const size = typeof props.size === 'number' ? props.size : 20
              return h(
                'svg',
                {
                  width: size,
                  height: size,
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: 1.7,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  'aria-hidden': true,
                  focusable: false,
                },
                h('rect', { x: 2.5, y: 5.5, width: 19, height: 13, rx: 2.4 }),
                h('path', { d: 'M6 9.2h.01M9.2 9.2h.01M12.4 9.2h.01M15.6 9.2h.01M18.8 9.2h.01' }),
                h('path', { d: 'M6 12.4h.01M9.2 12.4h.01M15.6 12.4h.01M18.8 12.4h.01' }),
                h('path', { d: 'M8.2 15.4h7.6' }),
              )
            }

        module.exports = { LearningAssistantIcon: TypingPracticeIcon }

      },
      "locales.js": function (module, exports, require) {
        const ZH = {
              learningAssistantTitle: 'Witty',
              learningAssistantSubtitle: '打字 · 阅读出题 · 作文训练',
              tabTypingReading: '打字与阅读',
              tabEssay: '作文训练',
              backgroundLabel: '背景',
              backgroundTitle: '自定义背景',
              backgroundSubtitle: '上传一张图片，作为整个 Witty 的玻璃底色。',
              backgroundDrop: '点击选择图片，或拖放到这里',
              backgroundFormats: 'PNG / JPEG / WebP · 最大 8MB',
              backgroundProcessing: '处理中…',
              backgroundApply: '应用背景',
              backgroundRemove: '恢复默认',
              backgroundPreview: '当前背景',
              backgroundDefault: '默认深水背景',
              backgroundHint: '图片会压缩并保存在本机浏览器，不会上传到服务器。',
              backgroundClose: '关闭',
              backgroundUnsupported: '请选择 PNG、JPEG 或 WebP 图片。',
              backgroundTooLarge: '图片过大，压缩后仍超过浏览器存储上限。',
              backgroundReadFailed: '读取图片失败，请换一张。',
              backgroundSaveFailed: '背景保存失败，浏览器存储空间可能不足。',
              favoritesClose: '关闭',
              favoritesOpen: '打开收藏夹',
              importArticle: '导入新文章',
              importTitle: '导入参考文章',
              importSubtitle: '粘贴文本或上传 .txt / .docx，开始新的打字练习。',
              importClose: '关闭',
              importPasteTab: '粘贴文本',
              importUploadTab: '上传文件',
              importPasteLabel: '英文原文',
              importPastePlaceholder: '把英文文章粘贴到这里…',
              importPasteHint: '导入后会自动清理多余空白，并按句拆分。',
              importChooseFile: '点击选择文件，或把文件拖到这里',
              importFileHint: '支持 .txt 和 .docx；.doc / .pdf 请先另存为 .docx 或 .txt。',
              importSelectedFile: '已选择',
              importDocxHint: 'DOCX 会在本地浏览器解析，不会上传到外部服务。',
              importCancel: '取消',
              importStart: '开始打字',
              importBusy: '解析中…',
              importNoFile: '请先选择一个文件。',
              importReadFailed: '读取文件失败：',
              importPastedTitle: '粘贴文章',
              wordLookingUp: '正在查询词义…',
              wordLookupFailed: '查词失败，请重试。',
              wordNoMeaning: '没有查到这个词的释义。',
              wordContextMeaning: '文中释义',
              wordDefinition: '词汇解释',
              wordCollocations: '常用搭配',
              wordEtymology: '词源',
              wordNoDefinition: '暂无词汇解释。',
              wordNoCollocations: '暂无常用搭配。',
              wordNoEtymology: '暂无可靠词源。',
              wordRetry: '重试',
              wordSave: '收藏为生词',
              wordSaving: '收藏中…',
              wordSaved: '已收藏',
              wordSaveFailed: '收藏失败：',
              wordClose: '关闭',
              wordLongman: '在朗文词典中查看',
              wordOxford: '在牛津词典中查看',
              wordDictionaryHint: '选择朗文或牛津词典，在内嵌页面中查看完整释义。',
              wordDictionaryLoading: '正在加载词典页面…',
              wordDictionaryFailed: '词典页面加载失败。',
              wordDictionaryUnsupported: '当前环境不支持内嵌词典，请在 DeepSeek Harness 桌面应用中使用。',
              wordDictionaryRetry: '重新加载',
              wordOpenExternal: '在浏览器中打开',
              wordSelectDictionary: '请先选择朗文或牛津词典。',
              panelTitle: '英语打字练习',
              panelSubtitle: '逐句跟打 · 每完成一句自动调用 DeepSeek 翻译',
              restart: '重新开始',
              resetConfirm: '重新开始会清空本次翻译记录，确定吗？',
              engineChecking: '正在检查 DeepSeek…',
              engineErrorShort: 'DeepSeek 未就绪',
              engineError: '无法检查 DeepSeek provider。',
              noFallbackHint: '翻译只走 Harness 已注册的 DeepSeek provider；不会回退到其他翻译源。',
              articleLabel: '原文 · 按句拆分',
              currentTitle: '本句翻译',
              sentenceLabel: '句子',
              translating: '正在翻译…',
              translationPlaceholder: '完成当前句后，这里会自动显示中文翻译。',
              translationFailed: '翻译失败',
              retry: '重试',
              recordsTitle: '翻译记录',
              recordsEmpty: '还没有记录。每完成一句，中英对照会追加到这里。',
              inputLabel: '逐句跟打',
              typingHint: '自动检测整句；按 Enter 也可确认当前句。',
              exactHint: '已完全匹配，正在进入下一句…',
              emptyHint: '先输入当前句，再按 Enter 确认。',
              notExactHint: '还没有完全匹配；按 Enter 仍可确认并进入下一句。',
              exact: '完全匹配',
              errorUnit: '处差异',
              extraChars: '多余字符',
              doneTitle: '本篇已完成',
              doneBody: '你已完成全部句子。可以查看右侧翻译记录，或重新开始。',
              failed: '失败',
              progressLabel: '进度',
              favoritesTitle: '收藏夹',
              favoritesSubtitle: '词汇与好句 · 保存在本地',
              favoriteAdd: '收藏',
              favoriteAddSentence: '收藏此句',
              favoriteSaved: '已收藏',
              favoriteSaving: '收藏中…',
              favoriteTypeWord: '生词',
              favoriteTypeSentence: '好句',
              favoritePickType: '收藏为',
              favoriteCancel: '取消',
              favoriteToastSaved: '已加入收藏夹',
              favoriteToastFailed: '收藏失败：',
              favoriteToastDuplicate: '该内容已收藏。',
              favoriteSelectionSource: '选区',
              favoritesFilterAll: '全部',
              favoritesRefresh: '刷新',
              favoritesDelete: '删除',
              favoritesDeleteConfirm: '删除这条收藏？',
              favoritesEmpty: '还没有收藏。在原文或译文里选中一段，或点句子旁的“收藏此句”。',
              favoritesLoading: '正在读取收藏…',
              favoritesSource: '来源',
              favoritesStorageError: '收藏夹存储不可用，请检查 Harness 的 storage 接缝。',
              favoriteTypeVocabulary: '词汇',
              favoritesTagFilter: '标签筛选',
              favoritesTagAll: '全部标签',
              favoritesTagAllShort: '全部',
              favoritesTagEmpty: '当前标签下还没有收藏。',
              favoritesFollowWord: '跟打',
              favoritesFollowSentence: '去跟打',
              favoritesEmbeddedPhrases: '内嵌短语',
              favoritesWritingVocab: '作文加分词',
              favoritesNoteAdd: '＋ 添加笔记',
              favoritesNoteEdit: '编辑笔记',
              favoritesNotePlaceholder: '写下这个词或这句话对你的意义、用法或记忆点…',
              favoritesNoteSave: '保存笔记',
              favoritesNoteSaving: '保存中…',
              favoritesNoteCancel: '取消',
              favoritesNoteFailed: '笔记保存失败。',
              readingButton: 'AI 精读',
              readingGeneratingShort: '精读中…',
              readingTitle: 'AI 智能精读',
              readingMeta: '细分话题 · 重点词汇 · 好句与内嵌短语',
              readingLoading: 'DeepSeek 正在逐层拆解这篇文章…',
              readingError: '精读生成失败，请重试。',
              readingRetry: '重试',
              readingTopics: '细分话题',
              readingVocabulary: '重点词汇',
              readingSentences: '好句与内嵌短语',
              readingWritingVocab: '作文加分词',
              readingSave: '收藏',
              readingSaved: '已收藏',
              readingSaveFailed: '收藏失败，请重试。',
              favoritesCountUnit: '条',
              quizGenerate: '基于本文出题',
              quizGenerating: '出题中…',
              quizOpen: '查看题目',
              quizRetry: '重试出题',
              quizTitle: '考研英语阅读 · 本文出题',
              quizSubtitle: '基于当前文章 · 5 道单选题',
              quizClose: '关闭',
              quizLoading: 'DeepSeek 正在根据本文命题…',
              quizLoadingHint: '模型需要先阅读全文并校验题目结构，请稍候。',
              quizError: '出题失败',
              quizErrorHint: '模型输出未通过结构校验时不会渲染半截题目；可以重试。',
              quizSubmit: '提交答案',
              quizAnswered: '已作答',
              quizNeedAll: '请先完成全部 5 道题。',
              quizScore: '得分',
              quizCorrect: '答对',
              quizWrong: '答错',
              quizYourAnswer: '你的答案',
              quizCorrectAnswer: '正确答案',
              quizExplanation: '解析',
              quizEvidence: '原文依据',
              quizReset: '重新作答',
              quizRegenerate: '重新出题',
              quizRegenerateConfirm: '重新出题会覆盖当前题目和作答，继续吗？',
              quizNoAnswer: '未作答',
              quizQuestionLabel: '题目',
              quizTypeDetail: '细节题',
              quizTypeInference: '推断题',
              quizTypeMainIdea: '主旨题',
              quizTypeAttitude: '态度题',
              quizTypeVocabulary: '词义题',
              quizTypeUnit: '种题型',
              quizAllAnswered: '全部作答',
              quizUnansweredUnit: '题未作答',
              quizArticleLabel: '当前文章',
              quizProvider: '命题模型',
              quizCoverage: '题型覆盖',
              quizGenerateHint: '基于当前正在练习的文章，不会抓取其他文章。',
              essayTitle: '作文训练',
              essaySubtitle: '考研英语一大作文 · 话题素材与 DeepSeek 评分',
              essayBoardTitle: '选择作文方向',
              essayBoardSubtitle: '先选大方向，再生成具体话题',
              essayPracticeCount: '练习次数',
              essayAverageScore: '平均分',
              essayStartPractice: '开始练习',
              essayRecommended: '⭐ 推荐练习',
              essayWeakArea: '薄弱项',
              essayTotalPractice: '累计练习',
              essayOverallAverage: '平均',
              essayStatsLoading: '正在读取练习记录…',
              essayStatsError: '练习统计加载失败。',
              essayStatsRetry: '重试',
              essayRefreshStats: '刷新统计',
              essayBackToBoard: '返回分类看板',
              essayLeaveConfirm: '返回看板会放弃当前未评分的作文，确定吗？',
              essayRecordFailed: '评分已生成，但本次记录保存失败：',
              essayCategorySocietyDesc: '社会热点、公共议题与舆论现象',
              essayCategoryTechnologyDesc: '科技应用、AI、平台与数字生活',
              essayCategoryCultureEducationDesc: '文化传承、教育公平与学习方式',
              essayCategoryPhilosophyDesc: '人生选择、价值观与成长思考',
              essayCategoryEconomyBusinessDesc: '消费、就业、商业伦理与经济变化',
              essayCategoryEnvironmentHealthDesc: '环境、健康、生活方式与可持续发展',
              essayCategoryCultureDesc: '文化传承、跨文化交流与传统创新',
              essayArchiveEntry: '📂 我的作文档案',
              essayArchiveTitle: '我的作文档案',
              essayArchiveSubtitle: '本地保存的完整作文训练记录',
              essayArchiveLoading: '正在读取作文档案…',
              essayArchiveEmpty: '还没有作文档案。完成一次作文评分后会自动保存。',
              essayArchiveError: '作文档案读取失败。',
              essayArchiveRefresh: '刷新档案',
              essayArchiveExport: '导出全部档案',
              essayArchiveExporting: '导出中…',
              essayArchiveExportError: '导出失败。',
              essayArchiveBack: '返回档案列表',
              essayArchiveDrawing: '作文题目图片',
              essayArchiveUserEssay: '我的作文',
              essayArchiveFeedback: 'AI 评分批改',
              essayArchiveSample: '高分范文',
              essayArchiveNoSample: '本次未生成范文。',
              essayArchiveCoreArgument: '核心论点',
              essayArchiveStrategy: '本次论证策略',
              essayArchiveImport: '🚀 一键导入打字板块',
              essayArchiveTypingTitle: '档案范文',
              essayGenerate: '给我一个话题',
              essayRegenerate: '换一个话题',
              essayGenerating: '生成话题中…',
              essayEmptyTitle: '开始一次作文训练',
              essayEmptyBody: '点击“给我一个话题”，DeepSeek 会生成一个考研英语一风格的话题，并附上相关词汇、高分表达和文化背景。',
              essayTopicLabel: '题目',
              essayVocabularyLabel: '相关词汇',
              essayExpressionsLabel: '相关表述',
              essayBackgroundLabel: '文化背景',
              essayPositionOpening: '开头',
              essayPositionBody: '主体',
              essayPositionConclusion: '结尾',
              essayWritingLabel: '你的作文',
              essayPlaceholder: '在这里写你的作文…',
              essayWordUnit: '词',
              essayWordTarget: '建议 160–200 词',
              essaySampleButton: '不会写？看高分范文',
              essaySampleGeneratingShort: '生成范文中…',
              essaySampleTitle: '高分范文',
              essaySampleBand: '第五档范文',
              essaySampleGenerating: '正在生成高分范文…',
              essaySampleError: '范文生成失败，请重试。',
              essaySampleRetry: '重试',
              essaySampleEnglish: '英文范文',
              essaySampleTranslation: '中文翻译',
              essaySampleHighlights: '亮点解析',
              essaySampleVocabulary: '亮点词汇',
              essaySampleStructure: '高分句型',
              essaySampleImport: '🚀 一键导入打字板块熟悉此文',
              essaySampleTypingTitle: '高分范文',
              sampleOverwriteConfirm: '当前有正在进行的练习，是否覆盖并开始新文章？',
              essaySubmit: '提交评分',
              essayScoring: '评分中…',
              essayScoreLoading: 'DeepSeek 正在按考研标准评分…',
              essayScoreError: '评分失败',
              essayRetryScore: '重新评分',
              essayResultTitle: '评分结果',
              essayTotalScore: '总分',
              essayBand: '档次',
              essayDimensionContent: '内容',
              essayDimensionStructure: '结构',
              essayDimensionLanguage: '语言',
              essayDimensionUnit: '分',
              essayFeedbackTitle: '段落批改',
              essayIssueGrammar: '语法',
              essayIssueWordChoice: '用词',
              essayIssueLogic: '逻辑',
              essayIssueCohesion: '衔接',
              essayProblem: '问题',
              essaySuggestion: '建议',
              essayImprovedTitle: '改写示范',
              essayBeforeScore: '提交作文后，这里会显示总分、档次、三个维度的分数、段落批改和段落范文。',
              essayTopicError: '话题生成失败',
              essayScoreNeedText: '先写一点内容再提交。',
              essayRegenerateConfirm: '换一个话题会清空当前作文和评分，继续吗？',
              essayModelLine: '评分模型',
              essayTopicLoadingHint: 'DeepSeek 正在生成话题和素材，请稍候。',
              essayErrorHint: '模型返回的结构不完整时，插件会拒绝渲染并允许重试。',
              essayTopicId: '话题编号',
              essayScoreHint: '内容 / 结构 / 语言各 1–5 分，按 20 分制换算',
              essayRetryTopic: '重试话题',
              essayWritingHint: '评分前不会显示分数、档次和反馈；段落之间空一行，便于逐段批改。',
              essayParagraphFeedbackTitle: '段落批改',
              essayParagraphPrefix: '第',
              essayParagraphSuffix: '段',
              essayParagraphOriginal: '原文片段',
              essayParagraphCritique: '段落批改意见',
              essayParagraphRewriteLabel: '满分段落展示',
              essayDrawingLabel: '图画',
              essayDrawingHint: '根据题目生成的简笔画',
            }
        
        const EN = {
              learningAssistantTitle: 'Witty',
              learningAssistantSubtitle: 'Typing · Reading quiz · Writing practice',
              tabTypingReading: 'Typing & Reading',
              tabEssay: 'Writing Practice',
              backgroundLabel: 'Background',
              backgroundTitle: 'Custom background',
              backgroundSubtitle: 'Upload one image and use it behind the whole Witty window.',
              backgroundDrop: 'Choose an image, or drop it here',
              backgroundFormats: 'PNG / JPEG / WebP · up to 8MB',
              backgroundProcessing: 'Processing…',
              backgroundApply: 'Apply background',
              backgroundRemove: 'Reset to default',
              backgroundPreview: 'Current background',
              backgroundDefault: 'Default deepwater background',
              backgroundHint: 'The image is compressed and saved in this browser only; it is not uploaded.',
              backgroundClose: 'Close',
              backgroundUnsupported: 'Choose a PNG, JPEG, or WebP image.',
              backgroundTooLarge: 'This image is too large even after compression.',
              backgroundReadFailed: 'Could not read that image. Try another one.',
              backgroundSaveFailed: 'Could not save the background; browser storage may be full.',
              favoritesClose: 'Close',
              favoritesOpen: 'Open favorites',
              importArticle: 'Import article',
              importTitle: 'Import a reference article',
              importSubtitle: 'Paste text or upload a .txt / .docx file to start a new typing session.',
              importClose: 'Close',
              importPasteTab: 'Paste text',
              importUploadTab: 'Upload file',
              importPasteLabel: 'English text',
              importPastePlaceholder: 'Paste an English article here…',
              importPasteHint: 'Extra whitespace is cleaned up and the text is split into sentences.',
              importChooseFile: 'Choose a file or drop it here',
              importFileHint: 'Supports .txt and .docx. For .doc or .pdf, save as .docx or .txt first.',
              importSelectedFile: 'Selected',
              importDocxHint: 'DOCX is parsed locally in the browser; the file is not uploaded.',
              importCancel: 'Cancel',
              importStart: 'Start typing',
              importBusy: 'Parsing…',
              importNoFile: 'Choose a file first.',
              importReadFailed: 'Could not read the file: ',
              importPastedTitle: 'Pasted Article',
              wordLookingUp: 'Looking up meaning…',
              wordLookupFailed: 'Lookup failed. Try again.',
              wordNoMeaning: 'No meaning found for this word.',
              wordContextMeaning: 'Meaning in context',
              wordDefinition: 'Dictionary definition',
              wordCollocations: 'Common collocations',
              wordEtymology: 'Etymology',
              wordNoDefinition: 'No dictionary definition available.',
              wordNoCollocations: 'No common collocations available.',
              wordNoEtymology: 'No reliable etymology available.',
              wordRetry: 'Retry',
              wordSave: 'Save as vocabulary',
              wordSaving: 'Saving…',
              wordSaved: 'Saved',
              wordSaveFailed: 'Could not save: ',
              wordClose: 'Close',
              wordLongman: 'View in Longman',
              wordOxford: 'View in Oxford',
              wordDictionaryHint: 'Choose Longman or Oxford to read the full entry inside this panel.',
              wordDictionaryLoading: 'Loading dictionary page…',
              wordDictionaryFailed: 'The dictionary page failed to load.',
              wordDictionaryUnsupported: 'Embedded dictionaries are only available in the DeepSeek Harness desktop app.',
              wordDictionaryRetry: 'Reload',
              wordOpenExternal: 'Open in browser',
              wordSelectDictionary: 'Choose Longman or Oxford first.',
              panelTitle: 'English Typing Practice',
              panelSubtitle: 'Type sentence by sentence · DeepSeek translates each completed sentence',
              restart: 'Start over',
              resetConfirm: 'Start over and clear the translation history?',
              engineChecking: 'Checking DeepSeek…',
              engineErrorShort: 'DeepSeek unavailable',
              engineError: 'Could not inspect the DeepSeek provider.',
              noFallbackHint: 'Translation uses only a registered DeepSeek provider in Harness; it never falls back to another source.',
              articleLabel: 'Text · split into sentences',
              currentTitle: 'Sentence translation',
              sentenceLabel: 'Sentence',
              translating: 'Translating…',
              translationPlaceholder: 'Finish the current sentence and its Chinese translation will appear here.',
              translationFailed: 'Translation failed',
              retry: 'Retry',
              recordsTitle: 'Translation history',
              recordsEmpty: 'No records yet. Each completed sentence will be added here with its translation.',
              inputLabel: 'Type along',
              typingHint: 'The sentence completes automatically; press Enter to confirm it as well.',
              exactHint: 'Exact match — moving to the next sentence…',
              emptyHint: 'Type the current sentence first, then press Enter to confirm.',
              notExactHint: 'Not an exact match yet; pressing Enter still confirms this sentence and moves on.',
              exact: 'Exact match',
              errorUnit: 'differences',
              extraChars: 'extra characters',
              doneTitle: 'Article complete',
              doneBody: 'You have completed every sentence. Review the translation history, or start over.',
              failed: 'Failed',
              progressLabel: 'Progress',
              favoritesTitle: 'Favorites',
              favoritesSubtitle: 'Vocabulary and sentences · stored locally',
              favoriteAdd: 'Save',
              favoriteAddSentence: 'Save sentence',
              favoriteSaved: 'Saved',
              favoriteSaving: 'Saving…',
              favoriteTypeWord: 'Word',
              favoriteTypeSentence: 'Sentence',
              favoritePickType: 'Save as',
              favoriteCancel: 'Cancel',
              favoriteToastSaved: 'Added to favorites',
              favoriteToastFailed: 'Could not save: ',
              favoriteToastDuplicate: 'This item is already saved.',
              favoriteSelectionSource: 'selection',
              favoritesFilterAll: 'All',
              favoritesRefresh: 'Refresh',
              favoritesDelete: 'Delete',
              favoritesDeleteConfirm: 'Delete this favorite?',
              favoritesEmpty: 'No favorites yet. Select text in the article or a translation, or use “Save sentence”.',
              favoritesLoading: 'Loading favorites…',
              favoritesSource: 'Source',
              favoritesStorageError: 'Favorites storage is unavailable. Check the Harness storage seam.',
              favoriteTypeVocabulary: 'Vocabulary',
              favoritesTagFilter: 'Tag filter',
              favoritesTagAll: 'All tags',
              favoritesTagAllShort: 'All',
              favoritesTagEmpty: 'No favorites under this tag yet.',
              favoritesFollowWord: 'Type',
              favoritesFollowSentence: 'Type this',
              favoritesEmbeddedPhrases: 'Embedded phrases',
              favoritesWritingVocab: 'Writing booster',
              favoritesNoteAdd: '＋ Add note',
              favoritesNoteEdit: 'Edit note',
              favoritesNotePlaceholder: 'Write what this word or sentence means to you, how to use it, or how to remember it…',
              favoritesNoteSave: 'Save note',
              favoritesNoteSaving: 'Saving…',
              favoritesNoteCancel: 'Cancel',
              favoritesNoteFailed: 'Could not save the note.',
              readingButton: 'AI Close Reading',
              readingGeneratingShort: 'Analyzing…',
              readingTitle: 'AI Close Reading',
              readingMeta: 'Specific topics · Key vocabulary · Good sentences with embedded phrases',
              readingLoading: 'DeepSeek is breaking down the article…',
              readingError: 'Could not generate the close reading. Try again.',
              readingRetry: 'Retry',
              readingTopics: 'Specific topics',
              readingVocabulary: 'Key vocabulary',
              readingSentences: 'Good sentences & phrases',
              readingWritingVocab: 'Writing booster',
              readingSave: 'Save',
              readingSaved: 'Saved',
              readingSaveFailed: 'Could not save. Try again.',
              favoritesCountUnit: 'items',
              quizGenerate: 'Generate from this article',
              quizGenerating: 'Generating…',
              quizOpen: 'View questions',
              quizRetry: 'Retry',
              quizTitle: 'Postgraduate English Reading · This article',
              quizSubtitle: 'Based on the current article · 5 multiple-choice questions',
              quizClose: 'Close',
              quizLoading: 'DeepSeek is writing questions from this article…',
              quizLoadingHint: 'The model reads the article and the result must pass schema validation.',
              quizError: 'Could not generate questions',
              quizErrorHint: 'Malformed output is rejected before rendering; you can retry.',
              quizSubmit: 'Submit answers',
              quizAnswered: 'answered',
              quizNeedAll: 'Answer all 5 questions first.',
              quizScore: 'Score',
              quizCorrect: 'Correct',
              quizWrong: 'Incorrect',
              quizYourAnswer: 'Your answer',
              quizCorrectAnswer: 'Correct answer',
              quizExplanation: 'Explanation',
              quizEvidence: 'Evidence',
              quizReset: 'Answer again',
              quizRegenerate: 'Regenerate',
              quizRegenerateConfirm: 'Regenerating will replace the current questions and answers. Continue?',
              quizNoAnswer: 'No answer',
              quizQuestionLabel: 'Question',
              quizTypeDetail: 'Detail',
              quizTypeInference: 'Inference',
              quizTypeMainIdea: 'Main idea',
              quizTypeAttitude: 'Attitude',
              quizTypeVocabulary: 'Vocabulary',
              quizTypeUnit: 'question types',
              quizAllAnswered: 'All answered',
              quizUnansweredUnit: 'unanswered',
              quizArticleLabel: 'Current article',
              quizProvider: 'Model',
              quizCoverage: 'Type coverage',
              quizGenerateHint: 'Uses the article currently being typed; no external article is fetched.',
              essayTitle: 'Writing Practice',
              essaySubtitle: 'Postgraduate English essay · topic, materials, and DeepSeek feedback',
              essayBoardTitle: 'Choose a writing direction',
              essayBoardSubtitle: 'Pick a broad direction, then generate a specific topic',
              essayPracticeCount: 'Attempts',
              essayAverageScore: 'Average',
              essayStartPractice: 'Start practice',
              essayRecommended: '⭐ Recommended',
              essayWeakArea: 'Weak area',
              essayTotalPractice: 'Total attempts',
              essayOverallAverage: 'Average',
              essayStatsLoading: 'Loading practice history…',
              essayStatsError: 'Could not load practice statistics.',
              essayStatsRetry: 'Retry',
              essayRefreshStats: 'Refresh stats',
              essayBackToBoard: 'Back to categories',
              essayLeaveConfirm: 'Leave this unscored draft and return to the categories?',
              essayRecordFailed: 'The score was generated, but this attempt could not be saved: ',
              essayCategorySocietyDesc: 'Social issues, public debate, and public opinion',
              essayCategoryTechnologyDesc: 'Technology, AI, platforms, and digital life',
              essayCategoryCultureEducationDesc: 'Cultural inheritance, education equity, and learning',
              essayCategoryPhilosophyDesc: 'Life choices, values, and personal growth',
              essayCategoryEconomyBusinessDesc: 'Consumption, employment, business ethics, and economic change',
              essayCategoryEnvironmentHealthDesc: 'Environment, health, lifestyle, and sustainability',
              essayCategoryCultureDesc: 'Cultural inheritance, exchange, and renewal',
              essayArchiveEntry: '📂 My essay archive',
              essayArchiveTitle: 'My essay archive',
              essayArchiveSubtitle: 'Complete essay practice records saved locally',
              essayArchiveLoading: 'Loading essay archive…',
              essayArchiveEmpty: 'No essays archived yet. One is saved after each scored essay.',
              essayArchiveError: 'Could not read the essay archive.',
              essayArchiveRefresh: 'Refresh archive',
              essayArchiveExport: 'Export all',
              essayArchiveExporting: 'Exporting…',
              essayArchiveExportError: 'Export failed.',
              essayArchiveBack: 'Back to archive',
              essayArchiveDrawing: 'Topic illustration',
              essayArchiveUserEssay: 'My essay',
              essayArchiveFeedback: 'AI feedback',
              essayArchiveSample: 'High-score sample',
              essayArchiveNoSample: 'No sample was generated for this attempt.',
              essayArchiveCoreArgument: 'Core argument',
              essayArchiveStrategy: 'Argument strategy',
              essayArchiveImport: '🚀 Import into Typing & Reading',
              essayArchiveTypingTitle: 'Archived sample',
              essayGenerate: 'Give me a topic',
              essayRegenerate: 'Change topic',
              essayGenerating: 'Generating topic…',
              essayEmptyTitle: 'Start a writing session',
              essayEmptyBody: 'Click “Give me a topic” and DeepSeek will create a postgraduate-style essay prompt with vocabulary, expressions, and cultural background.',
              essayTopicLabel: 'Prompt',
              essayVocabularyLabel: 'Related vocabulary',
              essayExpressionsLabel: 'Useful expressions',
              essayBackgroundLabel: 'Cultural background',
              essayPositionOpening: 'Opening',
              essayPositionBody: 'Body',
              essayPositionConclusion: 'Conclusion',
              essayWritingLabel: 'Your essay',
              essayPlaceholder: 'Write your essay here…',
              essayWordUnit: 'words',
              essayWordTarget: 'Target: 160–200 words',
              essaySampleButton: 'Stuck? Read a high-score sample',
              essaySampleGeneratingShort: 'Generating sample…',
              essaySampleTitle: 'High-score sample',
              essaySampleBand: 'Band 5 sample',
              essaySampleGenerating: 'Generating a high-score sample…',
              essaySampleError: 'Could not generate the sample. Try again.',
              essaySampleRetry: 'Retry',
              essaySampleEnglish: 'English sample',
              essaySampleTranslation: 'Chinese translation',
              essaySampleHighlights: 'Highlights',
              essaySampleVocabulary: 'Vocabulary',
              essaySampleStructure: 'Sentence pattern',
              essaySampleImport: '🚀 Import into Typing & Reading',
              essaySampleTypingTitle: 'High-score sample',
              sampleOverwriteConfirm: 'A typing practice is already in progress. Overwrite it and start the new article?',
              essaySubmit: 'Submit for scoring',
              essayScoring: 'Scoring…',
              essayScoreLoading: 'DeepSeek is scoring against the exam rubric…',
              essayScoreError: 'Scoring failed',
              essayRetryScore: 'Score again',
              essayResultTitle: 'Score and feedback',
              essayTotalScore: 'Total',
              essayBand: 'Band',
              essayDimensionContent: 'Content',
              essayDimensionStructure: 'Structure',
              essayDimensionLanguage: 'Language',
              essayDimensionUnit: 'pts',
              essayFeedbackTitle: 'Paragraph feedback',
              essayIssueGrammar: 'Grammar',
              essayIssueWordChoice: 'Word choice',
              essayIssueLogic: 'Logic',
              essayIssueCohesion: 'Cohesion',
              essayProblem: 'Problem',
              essaySuggestion: 'Suggestion',
              essayImprovedTitle: 'Improved key sentences',
              essayBeforeScore: 'Submit your essay to see the total score, band, three dimensions, paragraph feedback, and rewritten paragraphs.',
              essayTopicError: 'Could not generate a topic',
              essayScoreNeedText: 'Write something before submitting.',
              essayRegenerateConfirm: 'Changing the topic will clear the current essay and score. Continue?',
              essayModelLine: 'Scoring model',
              essayTopicLoadingHint: 'DeepSeek is generating the topic and materials. Please wait.',
              essayErrorHint: 'Incomplete model output is rejected before rendering; you can retry.',
              essayTopicId: 'Topic id',
              essayScoreHint: 'Content / structure / language, 1–5 each, converted to a 20-point score',
              essayRetryTopic: 'Retry topic',
              essayWritingHint: 'Scores, band, and feedback stay hidden until you submit. Leave a blank line between paragraphs for paragraph-by-paragraph feedback.',
              essayParagraphFeedbackTitle: 'Paragraph feedback',
              essayParagraphPrefix: 'Paragraph',
              essayParagraphSuffix: '',
              essayParagraphOriginal: 'Original excerpt',
              essayParagraphCritique: 'Paragraph critique',
              essayParagraphRewriteLabel: 'High-scoring paragraph',
              essayDrawingLabel: 'Picture',
              essayDrawingHint: 'A cartoon generated for this prompt',
            }
        
        module.exports = { ZH, EN }

      },
      "shared.js": function (module, exports, require) {
        const React = require('react')
        const h = React.createElement
        const { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } = React
        const NS = 'typing-practice'
        const API_BASE = '/plugins/witty'

            function useT(ctx) {
              const t = useMemo(() => ctx.locale.bind(NS), [ctx])
              const [, setRevision] = useState(0)
              useEffect(() => ctx.locale.subscribe(() => setRevision((value) => value + 1)), [ctx])
              return t
            }
            async function requestJson(path, options) {
              const settings = options || {}
              const response = await fetch(`${API_BASE}${path}`, {
                credentials: 'same-origin',
                cache: 'no-store',
                ...settings,
                headers: { ...(settings.headers || {}) },
              })

              let data
              try {
                data = await response.json()
              } catch {
                data = undefined
              }

              if (!response.ok) {
                const error = new Error(data?.error?.message || `请求失败（HTTP ${response.status}）。`)
                error.code = data?.error?.code || `HTTP_${response.status}`
                error.status = response.status
                throw error
              }
              return data
            }

        module.exports = {
          React, h, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
          NS, API_BASE, useT, requestJson,
        }

      },
      "shell.js": function (module, exports, require) {
        const { React, h, useCallback, useState, useT } = require('./shared.js')
        const { CSS, ESSAY_CSS, SHELL_CSS } = require('./styles.js')
        const { TypingWorkspace } = require('./typing/index.js')
        const { EssayWorkspace } = require('./essay/index.js')
        const { FavoritesDrawer } = require('./favorites/index.js')
        const {
          GlassBackgroundModal,
          clearStoredWallpaper,
          readStoredWallpaper,
          saveStoredWallpaper,
        } = require('./glass-background.js')

        function LearningShell(props) {
          const { ctx } = props
          const t = useT(ctx)
          const [activeTab, setActiveTab] = useState('typing')
          const [favoritesOpen, setFavoritesOpen] = useState(false)
          const [favoritesRevision, setFavoritesRevision] = useState(0)
          const [backgroundOpen, setBackgroundOpen] = useState(false)
          const [wallpaper, setWallpaper] = useState(() => readStoredWallpaper())
          const [pendingTypingArticle, setPendingTypingArticle] = useState(null)
          const [typingHasPractice, setTypingHasPractice] = useState(false)

          const onFavoriteSaved = useCallback(() => {
            setFavoritesRevision((current) => current + 1)
          }, [])

          const applyBackground = useCallback((next) => {
            if (!saveStoredWallpaper(next)) throw new Error(t('backgroundSaveFailed'))
            setWallpaper(next)
            setBackgroundOpen(false)
          }, [t])

          const removeBackground = useCallback(() => {
            clearStoredWallpaper()
            setWallpaper(null)
          }, [])

          const handleTypingPracticeChange = useCallback((value) => {
            setTypingHasPractice(value === true)
          }, [])

          const sendTextToTyping = useCallback((article) => {
            if (
              typingHasPractice
              && !window.confirm(t('sampleOverwriteConfirm'))
            ) {
              return false
            }
            setPendingTypingArticle({
              id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              title: article.title,
              text: article.text,
            })
            setActiveTab('typing')
            return true
          }, [typingHasPractice, t])

          const consumePendingTypingArticle = useCallback((id) => {
            setPendingTypingArticle((current) => (
              current !== null && current.id === id ? null : current
            ))
          }, [])

          const tabs = [
            { id: 'typing', label: t('tabTypingReading') },
            { id: 'essay', label: t('tabEssay') },
          ]

          return h(
            'div',
            {
              className: 'tp-shell',
              style: wallpaper === null
                ? undefined
                : { '--tp-wallpaper': `url("${wallpaper.dataUrl}")` },
            },
            h('style', null, `${CSS}\n${ESSAY_CSS}\n${SHELL_CSS}`),
            h(
              'header',
              { className: 'tp-shellHeader' },
              h(
                'div',
                { className: 'tp-shellHeading' },
                h('h1', { className: 'tp-shellTitle' }, t('learningAssistantTitle')),
                h('p', { className: 'tp-shellSubtitle' }, t('learningAssistantSubtitle')),
              ),
              h(
                'div',
                { className: 'tp-shellActions' },
                h(
                  'button',
                  {
                    className: 'tp-backgroundBtn',
                    type: 'button',
                    title: t('backgroundLabel'),
                    'aria-label': t('backgroundLabel'),
                    onClick: () => setBackgroundOpen(true),
                  },
                  t('backgroundLabel'),
                ),
                h(
                  'button',
                  {
                    className: 'tp-starBtn',
                    type: 'button',
                    title: t('favoritesOpen'),
                    'aria-label': t('favoritesOpen'),
                    onClick: () => setFavoritesOpen(true),
                  },
                  '★',
                ),
              ),
            ),
            h(
              'nav',
              { className: 'tp-tabs', role: 'tablist', 'aria-label': t('learningAssistantTitle') },
              tabs.map((tab) => h(
                'button',
                {
                  key: tab.id,
                  id: `tp-tab-${tab.id}`,
                  className: activeTab === tab.id ? 'tp-tab tp-tabActive' : 'tp-tab',
                  type: 'button',
                  role: 'tab',
                  'aria-selected': activeTab === tab.id,
                  'aria-controls': `tp-panel-${tab.id}`,
                  tabIndex: activeTab === tab.id ? 0 : -1,
                  onClick: () => setActiveTab(tab.id),
                },
                tab.label,
              )),
            ),
            h(
              'div',
              { className: 'tp-shellBody' },
              h(
                'div',
                {
                  id: 'tp-panel-typing',
                  className: 'tp-tabPanel',
                  role: 'tabpanel',
                  'aria-labelledby': 'tp-tab-typing',
                  hidden: activeTab !== 'typing',
                },
                h(TypingWorkspace, {
                  ctx,
                  embedded: true,
                  onFavoriteSaved,
                  pendingArticle: pendingTypingArticle,
                  onPendingArticleConsumed: consumePendingTypingArticle,
                  onPracticeStateChange: handleTypingPracticeChange,
                }),
              ),
              h(
                'div',
                {
                  id: 'tp-panel-essay',
                  className: 'tp-tabPanel',
                  role: 'tabpanel',
                  'aria-labelledby': 'tp-tab-essay',
                  hidden: activeTab !== 'essay',
                },
                h(EssayWorkspace, {
                  ctx,
                  embedded: true,
                  onSendSampleToTyping: sendTextToTyping,
                }),
              ),
            ),
            h(FavoritesDrawer, {
              ctx,
              open: favoritesOpen,
              onClose: () => setFavoritesOpen(false),
              refreshToken: favoritesRevision,
              onSendToTyping: sendTextToTyping,
            }),
            backgroundOpen
              ? h(GlassBackgroundModal, {
                  t,
                  current: wallpaper,
                  onApply: applyBackground,
                  onRemove: removeBackground,
                  onClose: () => setBackgroundOpen(false),
                })
              : null,
          )
        }

        module.exports = { LearningShell }

      },
      "styles.js": function (module, exports, require) {
        const CSS = `
              .tp-root {
                height: 100%;
                min-height: 0;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: 14px;
                padding: 22px 26px 24px;
                color: var(--dsw-alias-label-primary);
                background: var(--dsw-alias-bg-base);
                font-family: inherit;
              }
              .tp-header {
                flex: 0 0 auto;
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 18px;
              }
              .tp-heading { min-width: 0; }
              .tp-title {
                margin: 0;
                font-size: 20px;
                line-height: 1.3;
                font-weight: 650;
                letter-spacing: -0.01em;
              }
              .tp-subtitle {
                margin: 4px 0 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 12.5px;
                line-height: 1.55;
              }
              .tp-headerActions {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                flex-wrap: wrap;
                gap: 8px;
                max-width: 58%;
              }
              .tp-engine {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
                max-width: 390px;
                padding: 7px 11px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 999px;
                background: var(--dsw-alias-bg-layer-1);
                color: var(--dsw-alias-label-secondary);
                font-size: 11.5px;
                line-height: 1.3;
              }
              .tp-engineText {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .tp-engineText strong {
                color: var(--dsw-alias-label-primary);
                font-weight: 600;
              }
              .tp-engineMeta {
                margin-left: 6px;
                color: var(--dsw-alias-label-secondary);
                font-variant-numeric: tabular-nums;
              }
              .tp-dot {
                width: 7px;
                height: 7px;
                flex: 0 0 auto;
                border-radius: 50%;
                background: var(--dsw-alias-state-idle-primary);
              }
              .tp-dot-ok { background: var(--dsw-alias-state-success-primary); }
              .tp-dot-error { background: var(--dsw-alias-state-error-primary); }
              .tp-dot-pending { background: var(--dsw-alias-state-warn-primary); }
              .tp-alert {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                padding: 10px 12px;
                border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, transparent);
                border-radius: 10px;
                background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-base));
                color: var(--dsw-alias-state-error-primary);
                font-size: 12px;
                line-height: 1.55;
              }
              .tp-alertText { min-width: 0; }
              .tp-alertHint {
                margin-top: 3px;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-grid {
                flex: 1 1 auto;
                min-height: 0;
                display: grid;
                grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
                gap: 14px;
              }
              .tp-left,
              .tp-side {
                min-width: 0;
                min-height: 0;
                display: flex;
                flex-direction: column;
                gap: 14px;
              }
              .tp-card {
                box-sizing: border-box;
                min-width: 0;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 14px;
                background: var(--dsw-alias-bg-layer-1);
                overflow: hidden;
              }
              .tp-reader {
                flex: 1 1 auto;
                min-height: 220px;
                display: flex;
                flex-direction: column;
              }
              .tp-cardHead {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 13px 17px 11px;
                border-bottom: 1px solid var(--dsw-alias-border-l1);
              }
              .tp-cardTitle {
                margin: 0;
                font-size: 12.5px;
                line-height: 1.3;
                font-weight: 600;
                letter-spacing: 0.01em;
              }
              .tp-cardMeta {
                color: var(--dsw-alias-label-secondary);
                font-size: 11.5px;
                font-variant-numeric: tabular-nums;
              }
              .tp-article {
                flex: 1 1 auto;
                min-height: 0;
                overflow: auto;
                padding: 17px 18px 24px;
              }
              .tp-articleTitle {
                margin: 0 0 12px;
                font-size: 18px;
                line-height: 1.35;
                font-weight: 650;
                letter-spacing: -0.01em;
              }
              .tp-sentences {
                margin: 0;
                font-size: 16px;
                line-height: 2;
                letter-spacing: 0.002em;
                overflow-wrap: anywhere;
              }
              .tp-paragraph { margin: 0 0 1.05em; }
              .tp-paragraph:last-child { margin-bottom: 0; }
              .tp-sentence {
                border-radius: 5px;
                transition: background 120ms ease, color 120ms ease;
              }
              .tp-sentenceDone {
                color: var(--dsw-alias-label-secondary);
              }
              .tp-sentenceActive {
                padding: 2px 3px;
                background: color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent);
                box-shadow: inset 2px 0 0 var(--dsw-alias-brand-primary);
                color: var(--dsw-alias-label-primary);
              }
              .tp-char { white-space: pre-wrap; }
              .tp-word {
                cursor: pointer;
                border-radius: 2px;
                transition: background 100ms ease;
              }
              .tp-word:hover {
                background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);
                text-decoration: underline dotted var(--dsw-alias-brand-primary);
                text-underline-offset: 2px;
              }
              .tp-charError {
                color: var(--dsw-alias-state-error-primary);
                background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 17%, transparent);
                border-radius: 2px;
                text-decoration: underline wavy var(--dsw-alias-state-error-primary);
                text-underline-offset: 2px;
              }
              .tp-inputCard {
                flex: 0 0 auto;
                display: flex;
                flex-direction: column;
                gap: 9px;
                padding: 14px 17px 15px;
              }
              .tp-inputTop {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                font-size: 12px;
              }
              .tp-inputTop strong {
                font-weight: 600;
              }
              .tp-diff {
                color: var(--dsw-alias-state-error-primary);
                font-variant-numeric: tabular-nums;
              }
              .tp-diffOk { color: var(--dsw-alias-state-success-primary); }
              .tp-textarea {
                width: 100%;
                min-height: 92px;
                max-height: 150px;
                box-sizing: border-box;
                resize: vertical;
                padding: 10px 12px;
                border: 1px solid var(--dsw-alias-border-l2);
                border-radius: 9px;
                outline: none;
                background: var(--dsw-alias-bg-base);
                color: var(--dsw-alias-label-primary);
                font: inherit;
                font-size: 15px;
                line-height: 1.6;
                transition: border-color 120ms ease, box-shadow 120ms ease;
              }
              .tp-textarea:focus {
                border-color: var(--dsw-alias-brand-primary);
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
              }
              .tp-textarea::placeholder { color: var(--dsw-alias-label-secondary); }
              .tp-inputHint {
                min-height: 17px;
                color: var(--dsw-alias-label-secondary);
                font-size: 11.5px;
                line-height: 1.5;
              }
              .tp-inputHintWarn { color: var(--dsw-alias-state-warn-primary); }
              .tp-progress {
                height: 4px;
                margin-top: 2px;
                border-radius: 999px;
                background: var(--dsw-alias-bg-layer-2);
                overflow: hidden;
              }
              .tp-progressBar {
                height: 100%;
                border-radius: inherit;
                background: var(--dsw-alias-brand-primary);
                transition: width 180ms ease;
              }
              .tp-current {
                flex: 0 1 auto;
                max-height: 44%;
                display: flex;
                flex-direction: column;
              }
              .tp-currentBody {
                min-height: 100px;
                overflow: auto;
                padding: 14px 17px 16px;
              }
              .tp-chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 7px;
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 999px;
                background: rgba(8, 14, 24, 0.58) !important;
                color: rgba(244, 247, 248, 0.68) !important;
                font-size: 10.5px;
                line-height: 1.5;
                white-space: nowrap;
              }
              .tp-current .tp-btnSmall,
              .tp-recordHead .tp-btnSmall {
                background: rgba(8, 14, 24, 0.46) !important;
                border-color: rgba(216, 199, 163, 0.34) !important;
                color: #e6d6b5 !important;
              }
              .tp-current .tp-btnSmall:hover:not(:disabled),
              .tp-recordHead .tp-btnSmall:hover:not(:disabled) {
                background: rgba(216, 199, 163, 0.12) !important;
                border-color: rgba(216, 199, 163, 0.64) !important;
              }
              .tp-enSmall {
                margin: 0 0 10px;
                color: var(--dsw-alias-label-secondary);
                font-size: 12px;
                line-height: 1.55;
              }
              .tp-zh {
                margin: 0;
                font-size: 16px;
                line-height: 1.8;
                font-weight: 500;
              }
              .tp-providerLine {
                margin-top: 10px;
                color: var(--dsw-alias-label-secondary);
                font-size: 10.5px;
                line-height: 1.4;
                font-variant-numeric: tabular-nums;
              }
              .tp-placeholder {
                margin: 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 12.5px;
                line-height: 1.7;
              }
              .tp-pending {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: var(--dsw-alias-label-secondary);
                font-size: 12.5px;
                line-height: 1.6;
              }
              .tp-pending::before {
                content: '';
                width: 8px;
                height: 8px;
                border: 2px solid var(--dsw-alias-border-l2);
                border-top-color: var(--dsw-alias-brand-primary);
                border-radius: 50%;
                animation: tp-spin 800ms linear infinite;
              }
              @keyframes tp-spin { to { transform: rotate(360deg); } }
              .tp-records {
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
              }
              .tp-recordList {
                flex: 1 1 auto;
                min-height: 0;
                overflow: auto;
                padding: 4px 8px 10px;
              }
              .tp-record {
                padding: 11px 9px 12px;
                border-bottom: 1px solid var(--dsw-alias-border-l1);
              }
              .tp-record:last-child { border-bottom: 0; }
              .tp-recordHead {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 5px;
                color: var(--dsw-alias-label-secondary);
                font-size: 10.5px;
              }
              .tp-recordIndex {
                min-width: 22px;
                color: var(--dsw-alias-brand-primary);
                font-weight: 650;
                font-variant-numeric: tabular-nums;
              }
              .tp-recordStatus { margin-left: auto; }
              .tp-recordEn {
                margin: 0 0 5px;
                color: var(--dsw-alias-label-secondary);
                font-size: 12px;
                line-height: 1.55;
              }
              .tp-recordZh {
                margin: 0;
                font-size: 13.5px;
                line-height: 1.7;
              }
              .tp-muted { color: var(--dsw-alias-label-secondary); }
              .tp-recordError {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 10px;
                color: var(--dsw-alias-state-error-primary);
                font-size: 12px;
                line-height: 1.55;
              }
              .tp-empty {
                padding: 18px 16px;
                color: var(--dsw-alias-label-secondary);
                font-size: 12px;
                line-height: 1.7;
              }
              .tp-doneBox {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 18px 17px;
              }
              .tp-doneTitle {
                font-size: 15px;
                font-weight: 600;
              }
              .tp-doneBody {
                margin: 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 12.5px;
                line-height: 1.65;
              }
              .tp-btn {
                flex: 0 0 auto;
                padding: 5px 9px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 7px;
                background: var(--dsw-alias-bg-layer-2);
                color: var(--dsw-alias-label-primary);
                font: inherit;
                font-size: 11.5px;
                line-height: 1.45;
                cursor: pointer;
                transition: border-color 120ms ease, background 120ms ease;
              }
              .tp-btn:hover {
                border-color: var(--dsw-alias-border-l2);
                background: var(--dsw-alias-bg-layer-1);
              }
              .tp-btn:focus-visible {
                outline: 2px solid var(--dsw-alias-brand-primary);
                outline-offset: 2px;
              }
              .tp-btnSmall { padding: 3px 7px; font-size: 10.5px; }
              @media (max-width: 880px) {
                .tp-root { height: auto; min-height: 100%; overflow: auto; padding: 18px 18px 22px; }
                .tp-header { flex-direction: column; }
                .tp-headerActions { max-width: none; justify-content: flex-start; }
                .tp-grid { grid-template-columns: minmax(0, 1fr); flex: 0 0 auto; }
                .tp-reader { min-height: 300px; }
                .tp-current { max-height: none; }
                .tp-records { min-height: 280px; }
              }
        
              /* ---- favourites ---- */
              .tp-favBtn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 3px 9px;
                border-radius: 999px;
                border: 1px solid var(--dsw-alias-border-secondary);
                background: transparent;
                color: var(--dsw-alias-label-secondary);
                font-size: 11px;
                line-height: 1.5;
                cursor: pointer;
                transition: color .15s ease, border-color .15s ease, background .15s ease;
              }
              .tp-favBtn:hover:not(:disabled) {
                color: var(--dsw-alias-brand-primary);
                border-color: var(--dsw-alias-brand-primary);
              }
              .tp-favBtn:disabled { cursor: default; opacity: .85; }
              .tp-favBtnSaved {
                color: var(--dsw-alias-brand-primary);
                border-color: var(--dsw-alias-brand-primary);
                background: color-mix(in oklab, var(--dsw-alias-brand-primary) 10%, transparent);
              }
              .tp-favStar { font-size: 12px; line-height: 1; }
        
              .tp-favFloat {
                position: fixed;
                z-index: 60;
                transform: translate(-50%, calc(-100% - 10px));
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 8px;
                border-radius: 10px;
                border: 1px solid var(--dsw-alias-border-secondary);
                background: var(--dsw-alias-bg-elevated, var(--dsw-alias-bg-base));
                box-shadow: 0 8px 24px rgba(0, 0, 0, .16);
                white-space: nowrap;
              }
              .tp-favPickLabel {
                font-size: 11px;
                color: var(--dsw-alias-label-secondary);
                padding: 0 2px;
              }
              .tp-favCancel {
                border: none;
                background: transparent;
                color: var(--dsw-alias-label-tertiary);
                font-size: 11px;
                cursor: pointer;
                padding: 3px 4px;
              }
              .tp-favToast {
                position: fixed;
                right: 22px;
                bottom: 22px;
                z-index: 61;
                max-width: 320px;
                padding: 8px 14px;
                border-radius: 10px;
                font-size: 12px;
                color: #fff;
                background: var(--dsw-alias-brand-primary, #2b6cb0);
                box-shadow: 0 8px 24px rgba(0, 0, 0, .18);
              }
              .tp-favToastError { background: var(--dsw-alias-state-error, #c53030); }
        
              .tp-favRoot { gap: 12px; }
              .tp-favFilters {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
              }
              .tp-favChip {
                padding: 4px 12px;
                border-radius: 999px;
                border: 1px solid var(--dsw-alias-border-secondary);
                background: transparent;
                color: var(--dsw-alias-label-secondary);
                font-size: 12px;
                cursor: pointer;
              }
              .tp-favChipActive {
                color: var(--dsw-alias-brand-primary);
                border-color: var(--dsw-alias-brand-primary);
                background: color-mix(in oklab, var(--dsw-alias-brand-primary) 10%, transparent);
              }
              .tp-favList {
                flex: 1 1 auto;
                min-height: 0;
                overflow: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 2px 2px 8px;
              }
              .tp-favGroup {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 4px;
              }
              .tp-favGroupTitle {
                margin: 4px 2px 0;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: .02em;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-favItem {
                border: 1px solid var(--dsw-alias-border-secondary);
                border-radius: 12px;
                padding: 10px 12px;
                background: var(--dsw-alias-bg-base);
                display: flex;
                flex-direction: column;
                gap: 6px;
              }
              .tp-favItemHead {
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .tp-favType {
                font-size: 10.5px;
                padding: 1px 8px;
                border-radius: 999px;
                border: 1px solid var(--dsw-alias-border-secondary);
                color: var(--dsw-alias-label-secondary);
              }
              .tp-favTypeWord { color: #b7791f; border-color: #b7791f55; }
              .tp-favTypeSentence { color: #2b6cb0; border-color: #2b6cb055; }
              .tp-favMeta {
                font-size: 11px;
                color: var(--dsw-alias-label-tertiary);
              }
              .tp-favDel {
                margin-left: auto;
                border: none;
                background: transparent;
                color: var(--dsw-alias-label-tertiary);
                font-size: 11.5px;
                cursor: pointer;
                padding: 2px 4px;
              }
              .tp-favDel:hover { color: var(--dsw-alias-state-error, #c53030); }
              .tp-favText {
                margin: 0;
                font-size: 13.5px;
                line-height: 1.65;
                color: var(--dsw-alias-label-primary);
                white-space: pre-wrap;
                word-break: break-word;
              }
              .tp-favZh {
                margin: 0;
                font-size: 12.5px;
                line-height: 1.65;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-favSource {
                margin: 0;
                font-size: 11px;
                color: var(--dsw-alias-label-tertiary);
              }
              .tp-favState {
                padding: 28px 8px;
                text-align: center;
                font-size: 12.5px;
                color: var(--dsw-alias-label-tertiary);
              }
              .tp-favTypeTabs {
                display: flex;
                gap: 7px;
                padding: 2px 0;
              }
              .tp-favTypeTab {
                padding: 7px 14px;
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 999px;
                background: rgba(8, 14, 24, 0.46);
                color: rgba(244, 247, 248, 0.62);
                font: inherit;
                font-size: 12px;
                cursor: pointer;
              }
              .tp-favTypeTabActive {
                background: rgba(216, 199, 163, 0.16);
                border-color: rgba(216, 199, 163, 0.58);
                color: #e6d6b5;
                font-weight: 650;
              }
              .tp-favTagCloud {
                display: flex;
                flex-direction: column;
                gap: 7px;
                padding: 9px 10px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 11px;
                background: rgba(8, 14, 24, 0.34);
              }
              .tp-favTagCloudHead {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                color: rgba(244, 247, 248, 0.52);
                font-size: 10.5px;
                letter-spacing: .04em;
              }
              .tp-favTagClear {
                border: none;
                background: transparent;
                color: #e6d6b5;
                font-size: 10.5px;
                cursor: pointer;
              }
              .tp-favTagList {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
              }
              .tp-favTagSubList {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 2px;
                padding-top: 7px;
                border-top: 1px dashed rgba(255, 255, 255, 0.10);
              }
              .tp-favTagChip {
                padding: 3px 9px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.04);
                color: rgba(244, 247, 248, 0.66);
                font: inherit;
                font-size: 10.5px;
                cursor: pointer;
              }
              .tp-favTagChip:hover {
                border-color: rgba(216, 199, 163, 0.48);
                color: #f4f7f8;
              }
              .tp-favTagChipActive {
                background: rgba(216, 199, 163, 0.16);
                border-color: rgba(216, 199, 163, 0.62);
                color: #e6d6b5;
              }
              .tp-favItem {
                border-color: rgba(255, 255, 255, 0.13);
                background: rgba(10, 16, 26, 0.50);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
              }
              .tp-favItemHead {
                flex-wrap: wrap;
                row-gap: 6px;
              }
              .tp-favWriting {
                padding: 1px 7px;
                border: 1px solid rgba(216, 199, 163, 0.42);
                border-radius: 999px;
                color: #e6d6b5;
                font-size: 10px;
                line-height: 1.5;
                white-space: nowrap;
              }
              .tp-favItemActions {
                display: flex;
                align-items: center;
                gap: 5px;
                margin-left: auto;
              }
              .tp-favPlay {
                padding: 3px 9px;
                border: 1px solid rgba(216, 199, 163, 0.38);
                border-radius: 999px;
                background: rgba(8, 14, 24, 0.44);
                color: #e6d6b5;
                font: inherit;
                font-size: 10.5px;
                white-space: nowrap;
                cursor: pointer;
              }
              .tp-favPlay:hover {
                background: rgba(216, 199, 163, 0.12);
                border-color: rgba(216, 199, 163, 0.68);
              }
              .tp-favDel { margin-left: 0; }
              .tp-favTextRow {
                display: flex;
                align-items: baseline;
                gap: 8px;
                flex-wrap: wrap;
              }
              .tp-favTextRow .tp-favText { flex: 0 1 auto; }
              .tp-favPos {
                color: #e6d6b5;
                font-size: 10.5px;
                font-style: italic;
                white-space: nowrap;
              }
              .tp-favAnalysis {
                margin: 0;
                padding: 7px 9px;
                border-left: 2px solid rgba(216, 199, 163, 0.50);
                background: rgba(216, 199, 163, 0.06);
                color: rgba(244, 247, 248, 0.70);
                font-size: 11.5px;
                line-height: 1.65;
              }
              .tp-favPhrases {
                margin: 1px 0 0;
                border: 1px solid rgba(255, 255, 255, 0.11);
                border-radius: 8px;
                background: rgba(8, 14, 24, 0.30);
              }
              .tp-favPhrases summary {
                padding: 5px 8px;
                color: rgba(244, 247, 248, 0.54);
                font-size: 10.5px;
                cursor: pointer;
              }
              .tp-favPhraseList {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin: 0;
                padding: 0 8px 7px;
                list-style: none;
              }
              .tp-favPhraseList li {
                display: flex;
                gap: 7px;
                align-items: baseline;
                color: rgba(244, 247, 248, 0.58);
                font-size: 11px;
                line-height: 1.55;
              }
              .tp-favPhraseList strong { color: #f4f7f8; font-weight: 550; }
              .tp-favTags {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
              }
              .tp-favTag {
                padding: 1px 7px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.06);
                color: rgba(244, 247, 248, 0.52);
                font-size: 9.5px;
                line-height: 1.5;
              }
              .tp-favNote {
                margin: 1px 0 0;
                padding: 6px 8px;
                border-radius: 7px;
                background: rgba(216, 199, 163, 0.07);
                color: rgba(244, 247, 248, 0.66);
                font-size: 11px;
                line-height: 1.6;
                white-space: pre-wrap;
              }
              .tp-favNoteBtn {
                align-self: flex-start;
                border: none;
                background: transparent;
                color: rgba(244, 247, 248, 0.42);
                font: inherit;
                font-size: 10.5px;
                padding: 0;
                cursor: pointer;
              }
              .tp-favNoteBtn:hover { color: #e6d6b5; }
              .tp-favNoteEditor {
                display: flex;
                flex-direction: column;
                gap: 6px;
              }
              .tp-favNoteInput {
                width: 100%;
                box-sizing: border-box;
                resize: vertical;
                min-height: 64px;
                padding: 7px 9px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 8px;
                outline: none;
                background: rgba(8, 14, 24, 0.48);
                color: #f4f7f8;
                font: inherit;
                font-size: 11.5px;
                line-height: 1.6;
              }
              .tp-favNoteInput:focus { border-color: rgba(216, 199, 163, 0.60); }
              .tp-favNoteActions {
                display: flex;
                justify-content: flex-end;
                gap: 6px;
              }
        
              /* ---- quiz drawer ---- */
              .tp-root { position: relative; }
              .tp-cardHead { flex-wrap: wrap; row-gap: 8px; }
              .tp-cardHeadRight {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                flex-wrap: wrap;
              }
              .tp-quizBtn { white-space: nowrap; }
              .tp-readingBtn {
                background: rgba(8, 14, 24, 0.46) !important;
                border-color: rgba(216, 199, 163, 0.38) !important;
                color: #e6d6b5 !important;
                white-space: nowrap;
              }
              .tp-readingBtn:hover:not(:disabled) {
                background: rgba(216, 199, 163, 0.12) !important;
                border-color: rgba(216, 199, 163, 0.68) !important;
              }
              .tp-quizLayer {
                position: absolute;
                inset: 0;
                z-index: 70;
                display: flex;
                justify-content: flex-end;
              }
              .tp-quizBackdrop {
                position: absolute;
                inset: 0;
                background: color-mix(in srgb, var(--dsw-alias-bg-base) 58%, transparent);
              }
              .tp-quizDrawer {
                position: relative;
                z-index: 1;
                width: min(480px, 100%);
                height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                background: var(--dsw-alias-bg-base);
                border-left: 1px solid var(--dsw-alias-border-l2);
                box-shadow: -12px 0 32px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
              }
              .tp-quizHeader {
                flex: 0 0 auto;
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 10px;
                padding: 16px 18px 13px;
                border-bottom: 1px solid var(--dsw-alias-border-l1);
              }
              .tp-quizHeaderText { min-width: 0; }
              .tp-quizTitle {
                margin: 0;
                font-size: 15px;
                line-height: 1.35;
                font-weight: 650;
              }
              .tp-quizSubtitle {
                margin: 4px 0 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 11.5px;
                line-height: 1.5;
              }
              .tp-quizHeaderActions {
                display: flex;
                align-items: center;
                gap: 6px;
                flex: 0 0 auto;
              }
              .tp-quizBody {
                flex: 1 1 auto;
                min-height: 0;
                overflow: auto;
                padding: 14px 16px 18px;
              }
              .tp-quizLoading {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                padding: 56px 20px;
                text-align: center;
              }
              .tp-quizSpinner {
                width: 22px;
                height: 22px;
                border: 2px solid var(--dsw-alias-border-l2);
                border-top-color: var(--dsw-alias-brand-primary);
                border-radius: 50%;
                animation: tp-spin 800ms linear infinite;
              }
              .tp-quizLoadingText {
                font-size: 13px;
                color: var(--dsw-alias-label-primary);
              }
              .tp-quizLoadingHint {
                max-width: 300px;
                font-size: 11.5px;
                line-height: 1.6;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-quizErrorBox {
                padding: 18px 2px;
                display: flex;
                flex-direction: column;
                gap: 10px;
              }
              .tp-quizErrorTitle {
                font-size: 14px;
                font-weight: 600;
                color: var(--dsw-alias-state-error-primary);
              }
              .tp-quizErrorText {
                font-size: 12px;
                line-height: 1.65;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-quizErrorHint {
                font-size: 11px;
                line-height: 1.55;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-quizSummary {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 12px;
                padding: 9px 11px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 10px;
                background: var(--dsw-alias-bg-layer-1);
                font-size: 11.5px;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-quizSummary strong {
                color: var(--dsw-alias-label-primary);
                font-weight: 600;
              }
              .tp-quizQuestion {
                padding: 14px 13px 15px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 12px;
                background: var(--dsw-alias-bg-layer-1);
                margin-bottom: 12px;
              }
              .tp-quizQuestion:last-child { margin-bottom: 0; }
              .tp-quizQHead {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 8px;
              }
              .tp-quizIndex {
                font-size: 11.5px;
                font-weight: 650;
                color: var(--dsw-alias-brand-primary);
              }
              .tp-quizType {
                padding: 2px 7px;
                border-radius: 999px;
                background: var(--dsw-alias-bg-layer-2);
                color: var(--dsw-alias-label-secondary);
                font-size: 10px;
                line-height: 1.5;
              }
              .tp-quizResultOk {
                margin-left: auto;
                color: var(--dsw-alias-state-success-primary);
                font-size: 11px;
                font-weight: 600;
              }
              .tp-quizResultBad {
                margin-left: auto;
                color: var(--dsw-alias-state-error-primary);
                font-size: 11px;
                font-weight: 600;
              }
              .tp-quizStem {
                margin: 0 0 10px;
                font-size: 13.5px;
                line-height: 1.65;
                font-weight: 500;
              }
              .tp-quizOptions {
                display: flex;
                flex-direction: column;
                gap: 7px;
              }
              .tp-quizOption {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                padding: 8px 9px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 8px;
                background: var(--dsw-alias-bg-base);
                cursor: pointer;
                transition: border-color 120ms ease, background 120ms ease;
              }
              .tp-quizOption:hover { border-color: var(--dsw-alias-border-l2); }
              .tp-quizOptionSelected {
                border-color: var(--dsw-alias-brand-primary);
                background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-base));
              }
              .tp-quizOptionCorrect {
                border-color: var(--dsw-alias-state-success-primary);
                background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, var(--dsw-alias-bg-base));
              }
              .tp-quizOptionWrong {
                border-color: var(--dsw-alias-state-error-primary);
                background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-base));
              }
              .tp-quizOption input {
                margin-top: 2px;
                flex: 0 0 auto;
                accent-color: var(--dsw-alias-brand-primary);
              }
              .tp-quizOptionLabel {
                flex: 0 0 auto;
                width: 16px;
                font-size: 12px;
                font-weight: 650;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-quizOptionText {
                min-width: 0;
                font-size: 12.5px;
                line-height: 1.6;
              }
              .tp-quizAnswerBox {
                margin-top: 11px;
                padding-top: 10px;
                border-top: 1px dashed var(--dsw-alias-border-l1);
                display: flex;
                flex-direction: column;
                gap: 7px;
              }
              .tp-quizAnswerRow {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                font-size: 11.5px;
              }
              .tp-quizAnswerLabel { color: var(--dsw-alias-label-secondary); }
              .tp-quizAnswerValue {
                font-weight: 650;
                color: var(--dsw-alias-state-success-primary);
              }
              .tp-quizYourAnswer { color: var(--dsw-alias-label-secondary); }
              .tp-quizExplanation {
                margin: 0;
                font-size: 12px;
                line-height: 1.7;
                color: var(--dsw-alias-label-primary);
              }
              .tp-quizExplanation strong,
              .tp-quizEvidence strong {
                color: var(--dsw-alias-label-secondary);
                font-weight: 600;
              }
              .tp-quizEvidence {
                margin: 0;
                padding: 8px 10px;
                border-left: 2px solid var(--dsw-alias-brand-primary);
                border-radius: 0 7px 7px 0;
                background: var(--dsw-alias-bg-layer-2);
                font-size: 11.5px;
                line-height: 1.65;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-quizFooter {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 12px 16px;
                border-top: 1px solid var(--dsw-alias-border-l1);
                background: var(--dsw-alias-bg-base);
              }
              .tp-quizFooterMeta {
                font-size: 11.5px;
                line-height: 1.5;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-quizFooterMeta strong {
                color: var(--dsw-alias-label-primary);
                font-weight: 600;
              }
              .tp-quizNeedAll { color: var(--dsw-alias-state-warn-primary); }
              .tp-quizSubmit {
                padding: 6px 14px;
                border-color: transparent;
                background: var(--dsw-alias-brand-primary);
                color: var(--dsw-alias-bg-base);
                font-weight: 600;
              }
              .tp-quizSubmit:hover:not(:disabled) {
                background: var(--dsw-alias-brand-primary);
                border-color: transparent;
                opacity: .9;
              }
              .tp-quizSubmit:disabled {
                opacity: .45;
                cursor: not-allowed;
              }
              .tp-quizClose {
                border: none;
                background: transparent;
                color: var(--dsw-alias-label-secondary);
                font: inherit;
                font-size: 11.5px;
                cursor: pointer;
                padding: 4px 2px;
              }
              .tp-quizClose:hover { color: var(--dsw-alias-label-primary); }
              @media (max-width: 880px) {
                .tp-quizDrawer { width: 100%; }
              }
            `
        
            const ESSAY_CSS = `
              .tp-essayRoot { gap: 14px; }
              .tp-essayBoard {
                flex: 1 1 auto;
                min-height: 0;
                overflow: auto;
                display: flex;
                flex-direction: column;
                gap: 14px;
                padding: 2px;
              }
              .tp-essayBoardIntro {
                flex: 0 0 auto;
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              .tp-essayBoardTitle {
                margin: 0;
                font-size: 20px;
                line-height: 1.35;
                font-weight: 650;
              }
              .tp-essayBoardSubtitle {
                margin: 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 12.5px;
                line-height: 1.65;
              }
              .tp-essayBoardSummary {
                margin: 4px 0 0;
                color: var(--dsw-alias-brand-primary);
                font-size: 12px;
                font-weight: 600;
              }
              .tp-essayStatsLoading {
                color: var(--dsw-alias-label-secondary);
                font-size: 12px;
                line-height: 1.6;
              }
              .tp-essayPracticeCategory {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 11px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 9px;
                background: var(--dsw-alias-bg-layer-1);
                color: var(--dsw-alias-label-secondary);
                font-size: 12px;
                line-height: 1.5;
              }
              .tp-essayPracticeCategoryId {
                color: var(--dsw-alias-brand-primary);
                font-size: 10px;
                font-weight: 650;
                letter-spacing: .08em;
                text-transform: uppercase;
              }
              .tp-essayCategoryGrid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
              }
              .tp-essayCategoryCard {
                position: relative;
                display: flex;
                flex-direction: column;
                min-height: 235px;
                padding: 18px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 14px;
                background: var(--dsw-alias-bg-layer-1);
                overflow: hidden;
              }
              .tp-essayCategoryCardRecommended {
                border-color: var(--dsw-alias-brand-primary);
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--dsw-alias-brand-primary) 36%, transparent);
              }
              .tp-essayCategoryTop {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                min-height: 22px;
              }
              .tp-essayCategoryCode {
                color: var(--dsw-alias-label-secondary);
                font-size: 10.5px;
                font-weight: 600;
                letter-spacing: .08em;
                text-transform: uppercase;
              }
              .tp-essayCategoryBadge {
                display: inline-flex;
                align-items: center;
                padding: 3px 8px;
                border-radius: 999px;
                background: var(--dsw-alias-brand-primary);
                color: var(--dsw-alias-bg-base);
                font-size: 10.5px;
                font-weight: 650;
                white-space: nowrap;
              }
              .tp-essayCategoryTitle {
                margin: 8px 0 0;
                font-size: 18px;
                line-height: 1.35;
                font-weight: 650;
              }
              .tp-essayCategoryEn {
                margin: 2px 0 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 11px;
                line-height: 1.5;
              }
              .tp-essayCategoryDesc {
                margin: 8px 0 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 12px;
                line-height: 1.6;
              }
              .tp-essayCategoryStats {
                display: flex;
                gap: 28px;
                margin-top: 14px;
              }
              .tp-essayCategoryStatLabel {
                display: block;
                color: var(--dsw-alias-label-secondary);
                font-size: 10.5px;
                line-height: 1.4;
              }
              .tp-essayCategoryStatValue {
                display: block;
                margin-top: 2px;
                font-size: 16px;
                line-height: 1.35;
                font-weight: 650;
              }
              .tp-essayCategoryProgress {
                height: 6px;
                margin-top: 12px;
                overflow: hidden;
                border-radius: 999px;
                background: color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
              }
              .tp-essayCategoryProgress > span {
                display: block;
                height: 100%;
                border-radius: inherit;
                background: var(--dsw-alias-brand-primary);
              }
              .tp-essayCategoryStart {
                align-self: flex-start;
                margin-top: auto;
                padding-top: 7px;
                padding-bottom: 7px;
              }
              .tp-essayBackButton {
                border-color: var(--dsw-alias-border-l1);
                background: transparent;
                color: var(--dsw-alias-label-secondary);
              }
              .tp-essayBackButton:hover {
                color: var(--dsw-alias-label-primary);
                border-color: var(--dsw-alias-border-l2);
                background: transparent;
              }
              .tp-essayArchiveError {
                margin: 12px 0 0;
                color: var(--dsw-alias-state-error-primary);
                font-size: 11.5px;
                line-height: 1.6;
              }
              .tp-essayGrid {
                flex: 1 1 auto;
                min-height: 0;
                display: grid;
                grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
                gap: 14px;
              }
              .tp-essayCol {
                min-width: 0;
                min-height: 0;
                overflow: auto;
                display: flex;
                flex-direction: column;
                gap: 14px;
                padding-right: 2px;
              }
              .tp-essayCol > .tp-card { flex: 0 0 auto; }
              .tp-essayEmpty {
                flex: 1 1 auto;
                min-height: 320px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 32px;
                text-align: center;
                border: 1px dashed var(--dsw-alias-border-l2);
                border-radius: 14px;
                background: var(--dsw-alias-bg-layer-1);
              }
              .tp-essayEmptyIcon {
                font-size: 28px;
                line-height: 1;
                color: var(--dsw-alias-brand-primary);
              }
              .tp-essayEmptyTitle {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
              }
              .tp-essayEmptyBody {
                max-width: 460px;
                margin: 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 12.5px;
                line-height: 1.7;
              }
              .tp-essayTopicBody { padding: 14px 17px 17px; }
              .tp-essayTopicMeta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
              }
              .tp-essayPrompt {
                margin: 0;
                font-size: 14px;
                line-height: 1.8;
                white-space: pre-wrap;
              }
              .tp-essayMaterialBody { padding: 12px 14px 14px; }
              .tp-essayVocabGrid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 7px;
              }
              .tp-essayVocab {
                min-width: 0;
                padding: 7px 8px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 9px;
                background: rgba(8, 14, 24, 0.52);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
              }
              .tp-essayWord {
                display: block;
                color: #f4f7f8;
                font-size: 12px;
                font-weight: 600;
                line-height: 1.5;
                overflow-wrap: anywhere;
              }
              .tp-essayMeaning {
                display: block;
                margin-top: 2px;
                color: rgba(244, 247, 248, 0.58);
                font-size: 11px;
                line-height: 1.5;
              }
              .tp-essayExpressionList {
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
              .tp-essayExpression {
                padding: 8px 9px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 9px;
                background: rgba(8, 14, 24, 0.52);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
              }
              .tp-essayExpressionHead {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 8px;
              }
              .tp-essayExpressionText {
                color: #f4f7f8;
                font-size: 12px;
                font-weight: 600;
                line-height: 1.55;
                overflow-wrap: anywhere;
              }
              .tp-essayExpressionMeaning {
                margin: 4px 0 0;
                color: rgba(244, 247, 248, 0.58);
                font-size: 11px;
                line-height: 1.55;
              }
              .tp-essayPosition {
                flex: 0 0 auto;
                padding: 1px 6px;
                border: 1px solid rgba(216, 199, 163, 0.32);
                border-radius: 999px;
                background: rgba(216, 199, 163, 0.10);
                color: #e6d6b5;
                font-size: 9.5px;
                line-height: 1.6;
              }
              .tp-essayBackgroundList {
                margin: 0;
                padding: 0 0 0 18px;
                color: var(--dsw-alias-label-primary);
                font-size: 12px;
                line-height: 1.75;
              }
              .tp-essayBackgroundList li { margin: 0 0 6px; }
              .tp-essayBackgroundList li:last-child { margin-bottom: 0; }
              .tp-essayWriteBody { padding: 12px 14px 14px; }
              .tp-essayTextarea {
                width: 100%;
                min-height: 250px;
                max-height: 420px;
                box-sizing: border-box;
                resize: vertical;
                padding: 11px 12px;
                border: 1px solid var(--dsw-alias-border-l2);
                border-radius: 9px;
                outline: none;
                background: var(--dsw-alias-bg-base);
                color: var(--dsw-alias-label-primary);
                font: inherit;
                font-size: 13px;
                line-height: 1.7;
              }
              .tp-essayTextarea:focus {
                border-color: var(--dsw-alias-brand-primary);
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
              }
              .tp-essayTextarea::placeholder { color: var(--dsw-alias-label-secondary); }
              .tp-essayWriteFooter {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-top: 9px;
                flex-wrap: wrap;
              }
              .tp-essayWordCount {
                color: var(--dsw-alias-label-secondary);
                font-size: 11px;
                line-height: 1.5;
                font-variant-numeric: tabular-nums;
              }
              .tp-essayWordCount strong {
                color: var(--dsw-alias-label-primary);
                font-weight: 600;
              }
              .tp-essayWriteFooter .tp-essaySampleBtn {
                background: rgba(8, 14, 24, 0.46) !important;
                border-color: rgba(216, 199, 163, 0.42) !important;
                color: #e6d6b5 !important;
              }
              .tp-essayWriteFooter .tp-essaySampleBtn:hover:not(:disabled) {
                background: rgba(216, 199, 163, 0.12) !important;
                border-color: rgba(216, 199, 163, 0.70) !important;
              }
              .tp-essayHint {
                color: var(--dsw-alias-label-secondary);
                font-size: 10.5px;
                line-height: 1.5;
              }
              .tp-essayScoreBody { padding: 14px 15px 18px; }
              .tp-essayScoreHero {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                gap: 12px;
                padding: 12px 13px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 12px;
                background: rgba(8, 14, 24, 0.52);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
              }
              .tp-essayTotalLabel {
                color: var(--dsw-alias-label-secondary);
                font-size: 11px;
              }
              .tp-essayTotal {
                display: flex;
                align-items: baseline;
                gap: 6px;
                margin-top: 2px;
              }
              .tp-essayTotalNumber {
                font-size: 32px;
                line-height: 1;
                font-weight: 700;
                letter-spacing: -0.03em;
                color: #e6d6b5;
              }
              .tp-essayTotalMax {
                color: var(--dsw-alias-label-secondary);
                font-size: 13px;
              }
              .tp-essayBand { text-align: right; }
              .tp-essayBandLabel {
                color: var(--dsw-alias-label-secondary);
                font-size: 10.5px;
              }
              .tp-essayBandValue {
                margin-top: 4px;
                font-size: 12px;
                font-weight: 600;
              }
              .tp-essayDimensionGrid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 8px;
                margin-top: 10px;
              }
              .tp-essayDimension {
                padding: 9px 10px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 9px;
                background: rgba(8, 14, 24, 0.48);
              }
              .tp-essayDimensionLabel {
                color: var(--dsw-alias-label-secondary);
                font-size: 10.5px;
              }
              .tp-essayDimensionScore {
                margin-top: 3px;
                font-size: 18px;
                font-weight: 650;
                color: #f4f7f8;
              }
              .tp-essayDimensionMax {
                color: var(--dsw-alias-label-secondary);
                font-size: 10px;
                font-weight: 400;
              }
              .tp-essaySectionTitle {
                margin: 16px 0 8px;
                color: #f4f7f8;
                font-size: 12px;
                font-weight: 650;
              }
              .tp-essayFeedbackList {
                display: flex;
                flex-direction: column;
                gap: 9px;
              }
              .tp-essayFeedback {
                padding: 10px 11px;
                border: 1px solid rgba(255, 255, 255, 0.13);
                border-radius: 10px;
                background: rgba(8, 14, 24, 0.48);
              }
              .tp-essayFeedbackHead {
                display: flex;
                align-items: center;
                gap: 7px;
                margin-bottom: 5px;
              }
              .tp-essayIssue {
                padding: 1px 7px;
                border-radius: 999px;
                background: var(--dsw-alias-bg-layer-2);
                color: var(--dsw-alias-label-secondary);
                font-size: 9.5px;
                line-height: 1.6;
              }
              .tp-essayExcerpt {
                margin: 0 0 6px;
                padding: 6px 8px;
                border-left: 2px solid rgba(216, 199, 163, 0.58);
                border-radius: 0 6px 6px 0;
                background: rgba(8, 14, 24, 0.40);
                color: rgba(244, 247, 248, 0.62);
                font-size: 11.5px;
                line-height: 1.6;
                white-space: pre-wrap;
              }
              .tp-essayFeedbackLine {
                margin: 0 0 4px;
                font-size: 11.5px;
                line-height: 1.65;
              }
              .tp-essayFeedbackLine:last-child { margin-bottom: 0; }
              .tp-essayFeedbackLine strong {
                color: var(--dsw-alias-label-secondary);
                font-weight: 600;
              }
              .tp-essayImproved {
                margin: 0;
                padding: 10px 12px;
                border: 1px solid rgba(255, 255, 255, 0.13);
                border-radius: 10px;
                background: rgba(8, 14, 24, 0.46);
                font-size: 12px;
                line-height: 1.7;
                white-space: pre-wrap;
              }
              .tp-essayScroll {
                overflow-y: auto;
                overscroll-behavior: contain;
                scrollbar-width: thin;
                scrollbar-gutter: stable;
                padding-right: 4px;
              }
              .tp-essayVocabScroll { max-height: 190px; }
              .tp-essayExpressionScroll { max-height: 210px; }
              .tp-essayBackgroundScroll { max-height: 300px; }
              .tp-essayScroll::-webkit-scrollbar { width: 8px; }
              .tp-essayScroll::-webkit-scrollbar-track { background: transparent; }
              .tp-essayScroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.22);
                border-radius: 999px;
              }
              .tp-essayScroll::-webkit-scrollbar-thumb:hover {
                background: rgba(216, 199, 163, 0.42);
              }
              .tp-essayDrawingCard { flex: 0 0 auto; }
              .tp-essayDrawingBody { padding: 10px 12px 12px; }
              .tp-essayDrawingSvg {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 9px;
                background: #ffffff;
                overflow: auto;
              }
              .tp-essayDrawingSvg svg {
                display: block;
                width: 100%;
                height: auto;
                max-height: 280px;
              }
              .tp-essayParagraphList {
                display: flex;
                flex-direction: column;
                gap: 12px;
              }
              .tp-essayParagraph {
                padding: 12px;
                border: 1px solid rgba(255, 255, 255, 0.13);
                border-left: 3px solid rgba(216, 199, 163, 0.42);
                border-radius: 12px;
                background: rgba(8, 14, 24, 0.48);
              }
              .tp-essayParagraphHead { margin-bottom: 6px; }
              .tp-essayParagraphIndex {
                color: var(--dsw-alias-brand-primary);
                font-size: 12px;
                font-weight: 650;
              }
              .tp-essayParagraphOriginalLabel {
                margin: 4px 0 4px;
                color: var(--dsw-alias-label-secondary);
                font-size: 10.5px;
              }
              .tp-essayRewriteBlock {
                margin-top: 9px;
                padding: 10px 11px;
                border: 1px solid rgba(216, 199, 163, 0.28);
                border-radius: 9px;
                background: rgba(216, 199, 163, 0.08);
              }
              .tp-essayRewriteLabel {
                margin-bottom: 5px;
                color: var(--dsw-alias-brand-primary);
                font-size: 10.5px;
                font-weight: 600;
              }
              .tp-essayRewriteText {
                margin: 0;
                font-size: 12px;
                line-height: 1.7;
                white-space: pre-wrap;
              }
              .tp-essayProvider {
                margin-top: 10px;
                color: var(--dsw-alias-label-secondary);
                font-size: 10px;
                line-height: 1.45;
                font-variant-numeric: tabular-nums;
              }
              .tp-essayScorePlaceholder {
                padding: 22px 16px;
                color: var(--dsw-alias-label-secondary);
                font-size: 12px;
                line-height: 1.7;
              }
              @media (max-width: 980px) {
                .tp-essayGrid {
                  grid-template-columns: minmax(0, 1fr);
                  flex: 0 0 auto;
                }
                .tp-essayCol { overflow: visible; }
              }
              @media (max-width: 760px) {
                .tp-essayCategoryGrid { grid-template-columns: minmax(0, 1fr); }
                .tp-essayCategoryCard { min-height: 210px; }
              }
              @media (max-width: 620px) {
                .tp-essayVocabGrid { grid-template-columns: 1fr; }
                .tp-essayDimensionGrid { grid-template-columns: 1fr; }
                .tp-essayScoreHero {
                  flex-direction: column;
                  align-items: flex-start;
                }
                .tp-essayBand { text-align: left; }
              }
            `
        
        const SHELL_CSS = `
              .tp-shell {
                position: relative;
                height: 100%;
                min-height: 0;
                display: flex;
                flex-direction: column;
                background-color: #0a1220;
                background-image:
                  radial-gradient(120% 80% at 10% 0%, rgba(95, 145, 220, 0.18), transparent 55%),
                  linear-gradient(180deg, rgba(4, 8, 16, 0.28), rgba(4, 8, 16, 0.46)),
                  var(--tp-wallpaper, url("/dsh-liquid-glass/assets/liquid-glass-deepwater.b209a409aea86fd6.jpg"));
                background-position: center;
                background-size: cover;
                background-repeat: no-repeat;
                background-attachment: fixed;
                color: var(--dsw-alias-label-primary);
              }
              .tp-shellHeader {
                flex: 0 0 auto;
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                padding: 18px 26px 0;
              }
              .tp-shellHeading { min-width: 0; }
              .tp-shellTitle {
                margin: 0;
                font-size: 20px;
                line-height: 1.3;
                font-weight: 650;
                letter-spacing: -0.01em;
              }
              .tp-shellSubtitle {
                margin: 4px 0 0;
                color: var(--dsw-alias-label-secondary);
                font-size: 12.5px;
                line-height: 1.55;
              }
              .tp-shellActions {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .tp-backgroundBtn {
                height: 34px;
                padding: 0 12px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 9px;
                background: var(--dsw-alias-bg-layer-1);
                color: var(--dsw-alias-label-primary);
                font: inherit;
                font-size: 12px;
                line-height: 1;
                cursor: pointer;
              }
              .tp-backgroundBtn:hover {
                border-color: var(--dsw-alias-brand-primary);
                color: var(--dsw-alias-brand-primary);
              }
              .tp-backgroundBtn:focus-visible {
                outline: 2px solid var(--dsw-alias-brand-primary);
                outline-offset: 2px;
              }
              .tp-starBtn {
                width: 34px;
                height: 34px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 9px;
                background: var(--dsw-alias-bg-layer-1);
                color: var(--dsw-alias-brand-primary);
                font-size: 18px;
                line-height: 1;
                cursor: pointer;
              }
              .tp-starBtn:hover {
                border-color: var(--dsw-alias-brand-primary);
                background: var(--dsw-alias-bg-layer-2);
              }
              .tp-starBtn:focus-visible {
                outline: 2px solid var(--dsw-alias-brand-primary);
                outline-offset: 2px;
              }
              .tp-tabs {
                flex: 0 0 auto;
                display: flex;
                gap: 4px;
                padding: 14px 26px 0;
                border-bottom: 1px solid var(--dsw-alias-border-l1);
                overflow-x: auto;
              }
              .tp-tab {
                border: 0;
                border-bottom: 2px solid transparent;
                background: transparent;
                color: var(--dsw-alias-label-secondary);
                padding: 9px 12px 10px;
                font: inherit;
                font-size: 13px;
                line-height: 1.4;
                cursor: pointer;
                white-space: nowrap;
              }
              .tp-tab:hover { color: var(--dsw-alias-label-primary); }
              .tp-tabActive {
                color: var(--dsw-alias-label-primary);
                border-bottom-color: var(--dsw-alias-brand-primary);
                font-weight: 600;
              }
              .tp-tab:focus-visible {
                outline: 2px solid var(--dsw-alias-brand-primary);
                outline-offset: -2px;
              }
              .tp-shellBody {
                flex: 1 1 auto;
                min-height: 0;
              }
              .tp-tabPanel {
                height: 100%;
                min-height: 0;
              }
              .tp-tabPanel[hidden] { display: none !important; }
              .tp-headerEmbedded { justify-content: flex-end; }
              .tp-headerEmbedded .tp-headerActions { max-width: none; }
              .tp-embeddedRoot { padding-top: 8px; }
              .tp-favDrawerLayer {
                position: absolute;
                inset: 0;
                z-index: 90;
                display: flex;
                justify-content: flex-end;
              }
              .tp-favDrawerBackdrop {
                position: absolute;
                inset: 0;
                background: color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);
              }
              .tp-favDrawerPanel {
                position: relative;
                z-index: 1;
                width: min(440px, 100%);
                height: 100%;
                overflow: hidden;
                background: var(--dsw-alias-bg-base);
                border-left: 1px solid var(--dsw-alias-border-l2);
                box-shadow: -12px 0 32px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
              }
              .tp-favDrawerPanel .tp-root {
                height: 100%;
                padding: 18px 18px 20px;
              }
              .tp-favClose {
                width: 24px;
                height: 24px;
                border: 1px solid var(--dsw-alias-border-l1);
                border-radius: 7px;
                background: transparent;
                color: var(--dsw-alias-label-secondary);
                font-size: 16px;
                line-height: 1;
                cursor: pointer;
              }
              .tp-favClose:hover {
                color: var(--dsw-alias-label-primary);
                border-color: var(--dsw-alias-border-l2);
              }
              @media (max-width: 700px) {
                .tp-shellHeader { padding: 14px 16px 0; }
                .tp-tabs { padding: 10px 16px 0; }
              }
        
              /* Phase 2: status blocks use a lighter-touch glass tier so they do not
                 become white slabs and still read as different from main content cards. */
              .tp-engine {
                background: rgba(8, 14, 22, 0.58) !important;
                border: 1px solid rgba(255, 255, 255, 0.16) !important;
                border-radius: 999px !important;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
                color: rgba(244, 247, 248, 0.68) !important;
                -webkit-backdrop-filter: blur(10px) saturate(135%);
                backdrop-filter: blur(10px) saturate(135%);
              }
              .tp-engineText strong { color: #f4f7f8 !important; }
              .tp-engineMeta { color: rgba(244, 247, 248, 0.52) !important; }
        
              .tp-alert {
                background:
                  linear-gradient(90deg, rgba(255, 112, 112, 0.14), rgba(10, 15, 22, 0.70)) !important;
                border: 1px solid rgba(255, 120, 120, 0.34) !important;
                border-left: 3px solid #ff8b8b !important;
                border-radius: 12px !important;
                box-shadow:
                  inset 0 1px 0 rgba(255, 255, 255, 0.08),
                  0 14px 36px rgba(0, 0, 0, 0.24) !important;
                color: #ffd8d8 !important;
                -webkit-backdrop-filter: blur(10px) saturate(130%);
                backdrop-filter: blur(10px) saturate(130%);
              }
              .tp-alertHint { color: rgba(255, 226, 226, 0.58) !important; }
        
              .tp-essayEmpty {
                background: rgba(10, 16, 26, 0.48) !important;
                border: 1px solid rgba(255, 255, 255, 0.13) !important;
                border-radius: 20px !important;
                box-shadow:
                  inset 0 1px 0 rgba(255, 255, 255, 0.12),
                  0 22px 60px rgba(0, 0, 0, 0.24);
                -webkit-backdrop-filter: blur(16px) saturate(140%);
                backdrop-filter: blur(16px) saturate(140%);
              }
              .tp-essayEmpty.tp-essayLoading {
                flex: 0 0 auto;
                width: min(680px, 100%);
                min-height: 240px;
                margin: 7vh auto 0;
                padding: 32px;
                border-style: solid;
                background:
                  linear-gradient(145deg, rgba(25, 40, 58, 0.54), rgba(8, 15, 26, 0.44)) !important;
              }
              .tp-essayEmpty .tp-quizLoadingText { color: #f4f7f8; }
              .tp-essayEmpty .tp-quizLoadingHint { color: rgba(244, 247, 248, 0.62); }
        
              .tp-essayPracticeCategory {
                --tp-category-accent: #8ec5ff;
                background:
                  linear-gradient(
                    90deg,
                    color-mix(in srgb, var(--tp-category-accent) 16%, transparent),
                    rgba(8, 14, 22, 0.54)
                  ) !important;
                border: 1px solid color-mix(in srgb, var(--tp-category-accent) 34%, transparent) !important;
                border-left: 3px solid var(--tp-category-accent) !important;
                border-radius: 12px !important;
                color: rgba(244, 247, 248, 0.72) !important;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10);
                -webkit-backdrop-filter: blur(9px) saturate(130%);
                backdrop-filter: blur(9px) saturate(130%);
              }
              .tp-essayPracticeCategoryId { color: var(--tp-category-accent) !important; }
              .tp-essayPracticeCategory[data-category='society'] { --tp-category-accent: #8ec5ff; }
              .tp-essayPracticeCategory[data-category='philosophy'] { --tp-category-accent: #c4b5fd; }
              .tp-essayPracticeCategory[data-category='technology'] { --tp-category-accent: #6ee7d8; }
              .tp-essayPracticeCategory[data-category='culture'] { --tp-category-accent: #e6c78a; }
            `
        
        module.exports = { CSS, ESSAY_CSS, SHELL_CSS }

      },
      "typing/ImportArticleModal.js": function (module, exports, require) {
        const { React, h, useEffect, useRef, useState } = require('../shared.js')
        const {
          assertArticleText,
          extractArticleFile,
          structureArticleText,
          titleFromFile,
          validateImportFile,
        } = require('./article-import.js')

        const IMPORT_CSS = `
          .tp-importLayer {
            position: fixed;
            inset: 0;
            z-index: 120;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            padding: 24px;
          }
          .tp-importBackdrop {
            position: absolute;
            inset: 0;
            background: color-mix(in srgb, var(--dsw-alias-bg-base) 52%, transparent);
          }
          .tp-importModal {
            position: relative;
            z-index: 1;
            width: min(680px, 100%);
            max-height: calc(100vh - 48px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            background: var(--dsw-alias-bg-base);
            border: 1px solid var(--dsw-alias-border-l2);
            border-radius: 16px;
            box-shadow: 0 18px 60px color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
          }
          .tp-importHeader {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 17px 18px 12px;
            border-bottom: 1px solid var(--dsw-alias-border-l1);
          }
          .tp-importHeading { min-width: 0; }
          .tp-importTitle {
            margin: 0;
            font-size: 16px;
            line-height: 1.35;
            font-weight: 650;
          }
          .tp-importSubtitle {
            margin: 4px 0 0;
            color: var(--dsw-alias-label-secondary);
            font-size: 11.5px;
            line-height: 1.55;
          }
          .tp-importClose {
            flex: 0 0 auto;
            width: 26px;
            height: 26px;
            border: 1px solid var(--dsw-alias-border-l1);
            border-radius: 7px;
            background: transparent;
            color: var(--dsw-alias-label-secondary);
            font-size: 17px;
            line-height: 1;
            cursor: pointer;
          }
          .tp-importClose:hover { color: var(--dsw-alias-label-primary); }
          .tp-importTabs {
            display: flex;
            gap: 6px;
            padding: 10px 16px 0;
          }
          .tp-importTab {
            border: 1px solid transparent;
            border-radius: 8px;
            background: transparent;
            color: var(--dsw-alias-label-secondary);
            padding: 6px 10px;
            font: inherit;
            font-size: 12px;
            cursor: pointer;
          }
          .tp-importTabActive {
            border-color: var(--dsw-alias-border-l1);
            background: var(--dsw-alias-bg-layer-1);
            color: var(--dsw-alias-label-primary);
            font-weight: 600;
          }
          .tp-importBody {
            overflow: auto;
            padding: 14px 16px 16px;
            display: flex;
            flex-direction: column;
            gap: 9px;
          }
          .tp-importLabel {
            color: var(--dsw-alias-label-secondary);
            font-size: 11.5px;
            line-height: 1.5;
          }
          .tp-importTextarea {
            width: 100%;
            min-height: 220px;
            box-sizing: border-box;
            resize: vertical;
            padding: 10px 12px;
            border: 1px solid var(--dsw-alias-border-l2);
            border-radius: 9px;
            outline: none;
            background: var(--dsw-alias-bg-base);
            color: var(--dsw-alias-label-primary);
            font: inherit;
            font-size: 13px;
            line-height: 1.65;
          }
          .tp-importTextarea:focus {
            border-color: var(--dsw-alias-brand-primary);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
          }
          .tp-importTextarea::placeholder { color: var(--dsw-alias-label-secondary); }
          .tp-importDrop {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 7px;
            min-height: 128px;
            padding: 22px 16px;
            border: 1px dashed var(--dsw-alias-border-l2);
            border-radius: 10px;
            background: var(--dsw-alias-bg-layer-1);
            text-align: center;
            cursor: pointer;
          }
          .tp-importDrop:hover { border-color: var(--dsw-alias-brand-primary); }
          .tp-importDropIcon {
            color: var(--dsw-alias-brand-primary);
            font-size: 24px;
            line-height: 1;
          }
          .tp-importDropText { font-size: 12.5px; line-height: 1.5; }
          .tp-importDropHint {
            color: var(--dsw-alias-label-secondary);
            font-size: 11px;
            line-height: 1.5;
          }
          .tp-importFileMeta {
            padding: 7px 9px;
            border: 1px solid var(--dsw-alias-border-l1);
            border-radius: 8px;
            background: var(--dsw-alias-bg-layer-1);
            color: var(--dsw-alias-label-primary);
            font-size: 11.5px;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }
          .tp-importHint {
            color: var(--dsw-alias-label-secondary);
            font-size: 10.5px;
            line-height: 1.55;
          }
          .tp-importError {
            padding: 8px 10px;
            border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, transparent);
            border-radius: 8px;
            background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-base));
            color: var(--dsw-alias-state-error-primary);
            font-size: 11.5px;
            line-height: 1.55;
          }
          .tp-importFooter {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            padding: 12px 16px;
            border-top: 1px solid var(--dsw-alias-border-l1);
          }
          .tp-importPrimary {
            border-color: transparent;
            background: var(--dsw-alias-brand-primary);
            color: var(--dsw-alias-bg-base);
            font-weight: 600;
          }
          .tp-importPrimary:hover:not(:disabled) {
            background: var(--dsw-alias-brand-primary);
            border-color: transparent;
            opacity: .9;
          }
          .tp-importPrimary:disabled {
            opacity: .45;
            cursor: not-allowed;
          }
          /* Dark glass tier for the import dialog, matching the lookup modal. */
          .tp-importBackdrop {
            background: rgba(2, 6, 14, 0.60);
            -webkit-backdrop-filter: blur(4px);
            backdrop-filter: blur(4px);
          }
          .tp-importModal {
            border-color: rgba(255, 255, 255, 0.22);
            border-radius: 18px;
            background:
              linear-gradient(145deg, rgba(28, 43, 64, 0.96), rgba(10, 18, 32, 0.94)) !important;
            color: #f2f6ff;
          }
          .tp-importHeader,
          .tp-importFooter {
            border-color: rgba(255, 255, 255, 0.14);
          }
          .tp-importClose {
            background: rgba(10, 17, 28, 0.58);
            border-color: rgba(255, 255, 255, 0.22);
            color: rgba(244, 247, 248, 0.72);
          }
          .tp-importClose:hover {
            color: #f4f7f8;
            border-color: rgba(216, 199, 163, 0.62);
          }
          .tp-importTab {
            color: rgba(244, 247, 248, 0.58);
          }
          .tp-importTabActive {
            background: rgba(216, 199, 163, 0.15) !important;
            border-color: rgba(216, 199, 163, 0.56) !important;
            color: #e6d6b5 !important;
          }
          .tp-importTextarea {
            background: rgba(7, 13, 23, 0.56) !important;
            border-color: rgba(255, 255, 255, 0.16) !important;
            color: #f4f7f8 !important;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
          }
          .tp-importTextarea:focus {
            border-color: rgba(216, 199, 163, 0.68) !important;
            box-shadow: 0 0 0 3px rgba(216, 199, 163, 0.13) !important;
          }
          .tp-importTextarea::placeholder {
            color: rgba(244, 247, 248, 0.38) !important;
          }
          .tp-importDrop {
            background: rgba(7, 13, 23, 0.50) !important;
            border-color: rgba(255, 255, 255, 0.20) !important;
            color: rgba(244, 247, 248, 0.72);
          }
          .tp-importDrop:hover {
            border-color: rgba(216, 199, 163, 0.64) !important;
          }
          .tp-importDropIcon { color: #e6d6b5; }
          .tp-importFileMeta {
            background: rgba(7, 13, 23, 0.50) !important;
            border-color: rgba(255, 255, 255, 0.16) !important;
            color: #f4f7f8;
          }
          .tp-importHint {
            color: rgba(244, 247, 248, 0.50);
          }
          .tp-importError {
            background:
              linear-gradient(90deg, rgba(255, 112, 112, 0.14), rgba(10, 15, 22, 0.70)) !important;
            border-color: rgba(255, 120, 120, 0.34) !important;
            color: #ffb3b3 !important;
          }
          .tp-importPrimary {
            border-color: transparent !important;
            background: #d8c7a3 !important;
            color: #08111f !important;
          }
          .tp-importPrimary:hover:not(:disabled) {
            background: #e6d6b5 !important;
            opacity: 1;
          }
          .tp-importPrimary:disabled {
            background: rgba(216, 199, 163, 0.42) !important;
            color: rgba(8, 17, 31, 0.72) !important;
          }
          @media (max-width: 640px) {
            .tp-importLayer { padding: 12px; }
            .tp-importModal { max-height: calc(100vh - 24px); }
            .tp-importTextarea { min-height: 170px; }
          }
        `

        function ImportArticleModal(props) {
          const { t, onClose, onImport } = props
          const [mode, setMode] = useState('paste')
          const [pasted, setPasted] = useState('')
          const [file, setFile] = useState(null)
          const [error, setError] = useState('')
          const [busy, setBusy] = useState(false)
          const pasteRef = useRef(null)
          const fileInputRef = useRef(null)

          useEffect(() => {
            const onKeyDown = (event) => {
              if (event.key === 'Escape' && !busy) onClose()
            }
            window.addEventListener('keydown', onKeyDown)
            return () => window.removeEventListener('keydown', onKeyDown)
          }, [busy, onClose])

          useEffect(() => {
            if (mode === 'paste') pasteRef.current?.focus()
          }, [mode])

          function chooseFile(nextFile) {
            if (nextFile === null || nextFile === undefined) return
            try {
              validateImportFile(nextFile)
              setFile(nextFile)
              setError('')
            } catch (nextError) {
              setFile(null)
              setError(nextError?.message || t('importReadFailed'))
            }
          }

          function handleFileChange(event) {
            chooseFile(event.target.files?.[0])
            event.target.value = ''
          }

          function handleDrop(event) {
            event.preventDefault()
            chooseFile(event.dataTransfer?.files?.[0])
          }

          async function handleSubmit() {
            if (busy) return
            setBusy(true)
            setError('')
            try {
              let raw
              let fallbackTitle
              if (mode === 'paste') {
                raw = pasted
                fallbackTitle = t('importPastedTitle')
              } else {
                if (file === null) throw new Error(t('importNoFile'))
                raw = await extractArticleFile(file)
                fallbackTitle = titleFromFile(file.name)
              }
              const structured = structureArticleText(raw, fallbackTitle)
              const text = assertArticleText(structured.text)
              onImport({ title: structured.title, text })
            } catch (nextError) {
              setError(nextError?.message || t('importReadFailed'))
            } finally {
              setBusy(false)
            }
          }

          const canSubmit = !busy
            && (mode === 'paste' ? pasted.trim().length > 0 : file !== null)

          return h(
            'div',
            { className: 'tp-importLayer', onMouseUp: (event) => event.stopPropagation() },
            h('div', { className: 'tp-importBackdrop', onClick: busy ? undefined : onClose, 'aria-hidden': true }),
            h(
              'section',
              {
                className: 'tp-importModal',
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': t('importTitle'),
                onClick: (event) => event.stopPropagation(),
              },
              h('style', null, IMPORT_CSS),
              h(
                'header',
                { className: 'tp-importHeader' },
                h(
                  'div',
                  { className: 'tp-importHeading' },
                  h('h2', { className: 'tp-importTitle' }, t('importTitle')),
                  h('p', { className: 'tp-importSubtitle' }, t('importSubtitle')),
                ),
                h(
                  'button',
                  {
                    className: 'tp-importClose',
                    type: 'button',
                    'aria-label': t('importClose'),
                    title: t('importClose'),
                    disabled: busy,
                    onClick: onClose,
                  },
                  '×',
                ),
              ),
              h(
                'div',
                { className: 'tp-importTabs' },
                h(
                  'button',
                  {
                    className: mode === 'paste' ? 'tp-importTab tp-importTabActive' : 'tp-importTab',
                    type: 'button',
                    onClick: () => { setMode('paste'); setError('') },
                  },
                  t('importPasteTab'),
                ),
                h(
                  'button',
                  {
                    className: mode === 'upload' ? 'tp-importTab tp-importTabActive' : 'tp-importTab',
                    type: 'button',
                    onClick: () => { setMode('upload'); setError('') },
                  },
                  t('importUploadTab'),
                ),
              ),
              h(
                'div',
                { className: 'tp-importBody' },
                mode === 'paste'
                  ? h(
                      React.Fragment,
                      null,
                      h('label', { className: 'tp-importLabel', htmlFor: 'tp-import-text' }, t('importPasteLabel')),
                      h('textarea', {
                        id: 'tp-import-text',
                        ref: pasteRef,
                        className: 'tp-importTextarea',
                        value: pasted,
                        placeholder: t('importPastePlaceholder'),
                        onChange: (event) => setPasted(event.target.value),
                        spellCheck: false,
                      }),
                      h('div', { className: 'tp-importHint' }, t('importPasteHint')),
                    )
                  : h(
                      React.Fragment,
                      null,
                      h(
                        'div',
                        {
                          className: 'tp-importDrop',
                          role: 'button',
                          tabIndex: 0,
                          onClick: () => fileInputRef.current?.click(),
                          onKeyDown: (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              fileInputRef.current?.click()
                            }
                          },
                          onDrop: handleDrop,
                          onDragOver: (event) => event.preventDefault(),
                        },
                        h('div', { className: 'tp-importDropIcon' }, '⇧'),
                        h('div', { className: 'tp-importDropText' }, t('importChooseFile')),
                        h('div', { className: 'tp-importDropHint' }, t('importFileHint')),
                      ),
                      h('input', {
                        ref: fileInputRef,
                        type: 'file',
                        accept: '.txt,.docx',
                        style: { display: 'none' },
                        onChange: handleFileChange,
                      }),
                      file === null
                        ? null
                        : h(
                            'div',
                            { className: 'tp-importFileMeta' },
                            `${t('importSelectedFile')}：${file.name}`,
                          ),
                      h('div', { className: 'tp-importHint' }, t('importDocxHint')),
                    ),
                error.length === 0
                  ? null
                  : h('div', { className: 'tp-importError', role: 'alert' }, error),
              ),
              h(
                'footer',
                { className: 'tp-importFooter' },
                h(
                  'button',
                  { className: 'tp-btn', type: 'button', disabled: busy, onClick: onClose },
                  t('importCancel'),
                ),
                h(
                  'button',
                  {
                    className: 'tp-btn tp-importPrimary',
                    type: 'button',
                    disabled: !canSubmit,
                    onClick: handleSubmit,
                  },
                  busy ? t('importBusy') : t('importStart'),
                ),
              ),
            ),
          )
        }

        module.exports = { ImportArticleModal }

      },
      "typing/ReadingAnalysisModal.js": function (module, exports, require) {
        const { React, h, useEffect, useState } = require('../shared.js')

        const READING_CSS = `
          .tp-readingLayer {
            position: fixed;
            inset: 0;
            z-index: 127;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            padding: 20px;
          }
          .tp-readingBackdrop {
            position: absolute;
            inset: 0;
            background: rgba(2, 6, 14, 0.60);
            backdrop-filter: blur(4px);
          }
          .tp-readingCard {
            position: relative;
            z-index: 1;
            width: min(880px, 96vw);
            max-height: calc(100vh - 40px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 20px;
            background:
              linear-gradient(145deg, rgba(28, 43, 64, 0.97), rgba(9, 17, 30, 0.95));
            color: #f2f6ff;
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.46);
          }
          .tp-readingCard button { font: inherit; }
          .tp-readingClose {
            position: absolute;
            top: 14px;
            right: 14px;
            z-index: 2;
            width: 30px;
            height: 30px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 8px;
            background: rgba(10, 17, 28, 0.58);
            color: rgba(244, 247, 248, 0.72);
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
          }
          .tp-readingClose:hover {
            color: #f4f7f8;
            border-color: rgba(216, 199, 163, 0.62);
          }
          .tp-readingHead {
            flex: 0 0 auto;
            padding: 20px 24px 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.14);
          }
          .tp-readingTitle {
            margin: 0;
            padding-right: 30px;
            font-size: 20px;
            line-height: 1.35;
            font-weight: 650;
          }
          .tp-readingMeta {
            margin: 5px 0 0;
            color: rgba(244, 247, 248, 0.58);
            font-size: 11.5px;
            line-height: 1.5;
          }
          .tp-readingScroll {
            flex: 1 1 auto;
            min-height: 0;
            overflow: auto;
            padding: 18px 24px 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .tp-readingSection {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .tp-readingSectionTitle {
            margin: 0;
            color: #e6d6b5;
            font-size: 11px;
            line-height: 1.4;
            font-weight: 650;
            letter-spacing: .08em;
            text-transform: uppercase;
          }
          .tp-readingTopics {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .tp-readingTopic {
            padding: 4px 9px;
            border: 1px solid rgba(216, 199, 163, 0.28);
            border-radius: 999px;
            background: rgba(216, 199, 163, 0.10);
            color: #e6d6b5;
            font-size: 11px;
            line-height: 1.5;
          }
          .tp-readingVocab {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }
          .tp-readingVocabItem {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 9px 10px;
            border: 1px solid rgba(255, 255, 255, 0.13);
            border-radius: 10px;
            background: rgba(8, 14, 24, 0.42);
          }
          .tp-readingVocabMain {
            flex: 1 1 auto;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .tp-readingVocabWord {
            margin: 0;
            color: #f4f7f8;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 600;
          }
          .tp-readingVocabPos {
            margin-left: 6px;
            color: #e6d6b5;
            font-size: 10.5px;
            font-style: italic;
            font-weight: 400;
          }
          .tp-readingVocabMeaning {
            margin: 0;
            color: rgba(244, 247, 248, 0.66);
            font-size: 12px;
            line-height: 1.55;
          }
          .tp-readingWriting {
            align-self: flex-start;
            margin-top: 2px;
            padding: 1px 7px;
            border: 1px solid rgba(216, 199, 163, 0.42);
            border-radius: 999px;
            color: #e6d6b5;
            font-size: 9.5px;
            line-height: 1.5;
          }
          .tp-readingSave {
            flex: 0 0 auto;
            padding: 4px 9px;
            border: 1px solid rgba(216, 199, 163, 0.38);
            border-radius: 999px;
            background: rgba(8, 14, 24, 0.44);
            color: #e6d6b5;
            font-size: 10.5px;
            cursor: pointer;
          }
          .tp-readingSave:hover:not(:disabled) {
            background: rgba(216, 199, 163, 0.10);
            border-color: rgba(216, 199, 163, 0.68);
          }
          .tp-readingSave:disabled { opacity: .45; cursor: default; }
          .tp-readingSentence {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 10px 11px;
            border: 1px solid rgba(255, 255, 255, 0.13);
            border-radius: 10px;
            background: rgba(8, 14, 24, 0.42);
          }
          .tp-readingSentenceText {
            margin: 0;
            color: #f4f7f8;
            font-size: 13.5px;
            line-height: 1.7;
          }
          .tp-readingAnalysis {
            margin: 0;
            color: rgba(244, 247, 248, 0.64);
            font-size: 11.5px;
            line-height: 1.65;
          }
          .tp-readingPhrases {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
          }
          .tp-readingPhrase {
            padding: 2px 7px;
            border-radius: 7px;
            background: rgba(216, 199, 163, 0.08);
            color: rgba(244, 247, 248, 0.72);
            font-size: 10.5px;
            line-height: 1.5;
          }
          .tp-readingPhrase strong { color: #e6d6b5; font-weight: 550; }
          .tp-readingLoading,
          .tp-readingError {
            padding: 44px 12px;
            text-align: center;
            color: rgba(244, 247, 248, 0.62);
            font-size: 13px;
            line-height: 1.7;
          }
          .tp-readingError { color: #ffb3b3; }
          .tp-readingRetry {
            display: block;
            margin: 10px auto 0;
            border: none;
            background: transparent;
            color: #e6d6b5;
            font-size: 12px;
            cursor: pointer;
          }
          @media (max-width: 620px) {
            .tp-readingLayer { padding: 10px; }
            .tp-readingHead { padding: 18px 16px 12px; }
            .tp-readingScroll { padding: 14px 16px 18px; }
          }
        `

        function ReadingAnalysisModal(props) {
          const { t, state, onClose, onRetry, onSaveVocabulary, onSaveSentence } = props
          const [savingKey, setSavingKey] = useState(null)
          const [savedKeys, setSavedKeys] = useState([])
          const [saveError, setSaveError] = useState('')

          useEffect(() => {
            const onKeyDown = (event) => {
              if (event.key === 'Escape') onClose()
            }
            window.addEventListener('keydown', onKeyDown)
            return () => window.removeEventListener('keydown', onKeyDown)
          }, [onClose])

          const analysis = state.status === 'ready' ? state.data : null

          async function save(kind, item, index) {
            if (typeof onSaveVocabulary !== 'function' && kind === 'vocabulary') return
            if (typeof onSaveSentence !== 'function' && kind === 'sentence') return
            const key = `${kind}-${index}`
            if (savedKeys.includes(key)) return
            setSavingKey(key)
            setSaveError('')
            try {
              if (kind === 'vocabulary') await onSaveVocabulary(item)
              else await onSaveSentence(item)
              setSavedKeys((current) => current.concat(key))
            } catch (error) {
              setSaveError(error?.message || t('readingSaveFailed'))
            } finally {
              setSavingKey(null)
            }
          }

          return h(
            'div',
            {
              className: 'tp-readingLayer',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': t('readingTitle'),
              onClick: onClose,
            },
            h('div', { className: 'tp-readingBackdrop', 'aria-hidden': true }),
            h(
              'section',
              {
                className: 'tp-readingCard',
                onClick: (event) => event.stopPropagation(),
              },
              h('style', null, READING_CSS),
              h(
                'button',
                {
                  className: 'tp-readingClose',
                  type: 'button',
                  'aria-label': t('wordClose'),
                  title: t('wordClose'),
                  onClick: onClose,
                },
                '×',
              ),
              h(
                'header',
                { className: 'tp-readingHead' },
                h('h2', { className: 'tp-readingTitle' }, t('readingTitle')),
                h('p', { className: 'tp-readingMeta' }, t('readingMeta')),
              ),
              saveError.length > 0
                ? h('div', { className: 'tp-readingError' }, saveError)
                : null,
              state.status === 'loading'
                ? h('div', { className: 'tp-readingLoading' }, t('readingLoading'))
                : state.status === 'error'
                  ? h(
                      'div',
                      { className: 'tp-readingError' },
                      state.error?.message || t('readingError'),
                      h(
                        'button',
                        { className: 'tp-readingRetry', type: 'button', onClick: onRetry },
                        t('readingRetry'),
                      ),
                    )
                  : analysis === null
                    ? null
                    : h(
                        'div',
                        { className: 'tp-readingScroll' },
                        h(
                          'section',
                          { className: 'tp-readingSection' },
                          h('h3', { className: 'tp-readingSectionTitle' }, t('readingTopics')),
                          h(
                            'div',
                            { className: 'tp-readingTopics' },
                            analysis.topics.map((topic) => h(
                              'span',
                              {
                                className: 'tp-readingTopic',
                                key: `${topic.category}/${topic.subcategory}`,
                              },
                              `${topic.category} / ${topic.subcategory}`,
                            )),
                          ),
                        ),
                        h(
                          'section',
                          { className: 'tp-readingSection' },
                          h('h3', { className: 'tp-readingSectionTitle' }, t('readingVocabulary')),
                          h(
                            'div',
                            { className: 'tp-readingVocab' },
                            analysis.vocabulary.map((item, index) => {
                              const key = `vocabulary-${index}`
                              return h(
                                'div',
                                { className: 'tp-readingVocabItem', key },
                                h(
                                  'div',
                                  { className: 'tp-readingVocabMain' },
                                  h(
                                    'p',
                                    { className: 'tp-readingVocabWord' },
                                    item.word,
                                    h('span', { className: 'tp-readingVocabPos' }, item.pos),
                                  ),
                                  h('p', { className: 'tp-readingVocabMeaning' }, item.meaning),
                                  item.is_writing_vocab
                                    ? h('span', { className: 'tp-readingWriting' }, t('readingWritingVocab'))
                                    : null,
                                ),
                                h(
                                  'button',
                                  {
                                    className: 'tp-readingSave',
                                    type: 'button',
                                    disabled: savingKey === key || savedKeys.includes(key),
                                    onClick: () => { void save('vocabulary', item, index) },
                                  },
                                  savedKeys.includes(key) ? t('readingSaved') : t('readingSave'),
                                ),
                              )
                            }),
                          ),
                        ),
                        h(
                          'section',
                          { className: 'tp-readingSection' },
                          h('h3', { className: 'tp-readingSectionTitle' }, t('readingSentences')),
                          analysis.good_sentences.map((item, index) => {
                            const key = `sentence-${index}`
                            return h(
                              'article',
                              { className: 'tp-readingSentence', key },
                              h('p', { className: 'tp-readingSentenceText' }, item.sentence),
                              h('p', { className: 'tp-readingAnalysis' }, item.analysis),
                              h(
                                'div',
                                { className: 'tp-readingPhrases' },
                                item.embedded_phrases.map((phrase, phraseIndex) => h(
                                  'span',
                                  { className: 'tp-readingPhrase', key: phraseIndex },
                                  h('strong', null, phrase.phrase),
                                  ` ${phrase.meaning}`,
                                )),
                              ),
                              h(
                                'button',
                                {
                                  className: 'tp-readingSave',
                                  type: 'button',
                                  disabled: savingKey === key || savedKeys.includes(key),
                                  onClick: () => { void save('sentence', item, index) },
                                },
                                savedKeys.includes(key) ? t('readingSaved') : t('readingSave'),
                              ),
                            )
                          }),
                        ),
                      ),
            ),
          )
        }

        module.exports = { ReadingAnalysisModal }

      },
      "typing/WordModal.js": function (module, exports, require) {
        const { React, h, useEffect, useRef, useState } = require('../shared.js')
        const { DICTIONARY_WORKSPACE_KEY } = require('./dictionary-session.js')
        const { dictionaryUrl } = require('./word-lookup.js')

        const WORD_MODAL_CSS = `
          .tp-wordModalLayer {
            position: fixed;
            inset: 0;
            z-index: 125;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            padding: 20px;
          }
          .tp-wordModalBackdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
          }
          .tp-wordModalCard {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(400px, 0.92fr);
            grid-template-rows: auto minmax(0, 1fr);
            width: min(1120px, 96vw);
            height: min(86vh, 900px);
            max-height: calc(100vh - 40px);
            overflow: hidden;
            box-sizing: border-box;
            border: 1px solid var(--dsw-alias-border-l2);
            border-radius: 18px;
            background: var(--dsw-alias-bg-base);
            box-shadow: 0 24px 70px color-mix(in srgb, #000000 42%, transparent);
            color: var(--dsw-alias-label-primary);
          }
          .tp-wordModalClose {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 3;
            width: 28px;
            height: 28px;
            border: 1px solid var(--dsw-alias-border-l1);
            border-radius: 8px;
            background: var(--dsw-alias-bg-base);
            color: var(--dsw-alias-label-secondary);
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
          }
          .tp-wordModalClose:hover {
            color: var(--dsw-alias-label-primary);
            border-color: var(--dsw-alias-border-l2);
          }
          .tp-wordModalSummary {
            grid-column: 1 / -1;
            grid-row: 1;
            padding: 20px 24px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          }
          .tp-wordModalInfo {
            grid-column: 1;
            grid-row: 2;
            min-height: 0;
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 18px 24px 24px;
          }
          .tp-wordModalSection {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .tp-wordModalSectionTitle {
            margin: 0;
            color: #e6d6b5;
            font-size: 11px;
            line-height: 1.4;
            font-weight: 650;
            letter-spacing: .08em;
            text-transform: uppercase;
          }
          .tp-wordModalBodyText {
            margin: 0;
            color: rgba(244, 247, 248, 0.82);
            font-size: 13.5px;
            line-height: 1.75;
            white-space: pre-wrap;
          }
          .tp-wordModalCollocations {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin: 4px 0 0;
            padding: 0;
            list-style: none;
          }
          .tp-wordModalCollocations li {
            padding: 7px 10px;
            border: 1px solid rgba(255, 255, 255, 0.13);
            border-radius: 9px;
            background: rgba(8, 14, 24, 0.42);
            color: rgba(244, 247, 248, 0.84);
            font-size: 12.5px;
            line-height: 1.55;
          }
          .tp-wordModalWord {
            margin: 0;
            padding-right: 32px;
            font-size: 30px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: -0.02em;
            overflow-wrap: anywhere;
          }
          .tp-wordModalPhonetic {
            margin: 6px 0 0;
            color: var(--dsw-alias-label-secondary);
            font-size: 13px;
            line-height: 1.5;
          }
          .tp-wordModalMeaning {
            margin: 12px 0 0;
            padding: 10px 12px;
            border: 1px solid var(--dsw-alias-border-l1);
            border-radius: 10px;
            background: var(--dsw-alias-bg-layer-1);
            font-size: 14px;
            line-height: 1.65;
            white-space: pre-wrap;
          }
          .tp-wordModalStatus {
            margin: 12px 0 0;
            color: var(--dsw-alias-label-secondary);
            font-size: 13px;
            line-height: 1.6;
          }
          .tp-wordModalError {
            margin: 8px 0 0;
            color: var(--dsw-alias-state-error-primary);
            font-size: 12px;
            line-height: 1.55;
          }
          .tp-wordModalActions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
          }
          .tp-wordModalSave {
            border-color: transparent;
            background: var(--dsw-alias-brand-primary);
            color: var(--dsw-alias-bg-base);
            font-weight: 600;
            padding: 7px 13px;
          }
          .tp-wordModalSave:hover:not(:disabled) {
            background: var(--dsw-alias-brand-primary);
            border-color: transparent;
            opacity: .9;
          }
          .tp-wordModalSave:disabled {
            opacity: .45;
            cursor: not-allowed;
          }
          .tp-wordModalExternal {
            border: 1px solid var(--dsw-alias-border-l1);
            background: var(--dsw-alias-bg-layer-1);
            color: var(--dsw-alias-label-primary);
            font-size: 12px;
            padding: 7px 11px;
          }
          .tp-wordModalExternal:hover:not(:disabled) {
            border-color: var(--dsw-alias-brand-primary);
            color: var(--dsw-alias-brand-primary);
            background: var(--dsw-alias-bg-layer-1);
          }
          .tp-wordModalExternal:disabled {
            opacity: .45;
            cursor: not-allowed;
          }
          .tp-wordModalDictionary {
            grid-column: 2;
            grid-row: 2;
            min-height: 0;
            display: flex;
            flex-direction: column;
            padding: 12px 16px 16px;
            border-top: 0;
            border-left: 1px solid rgba(255, 255, 255, 0.12);
            margin-top: 0;
          }
          .tp-wordModalDictTabs {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 11px 0;
          }
          .tp-wordModalDictTab {
            padding: 6px 11px;
            border: 1px solid var(--dsw-alias-border-l1);
            border-radius: 8px;
            background: var(--dsw-alias-bg-layer-1);
            color: var(--dsw-alias-label-primary);
            font: inherit;
            font-size: 12px;
            line-height: 1.45;
            cursor: pointer;
          }
          .tp-wordModalDictTab:hover:not(:disabled) {
            border-color: var(--dsw-alias-brand-primary);
            color: var(--dsw-alias-brand-primary);
          }
          .tp-wordModalDictTabActive {
            border-color: var(--dsw-alias-brand-primary);
            background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, var(--dsw-alias-bg-layer-1));
            color: var(--dsw-alias-brand-primary);
            font-weight: 600;
          }
          .tp-wordModalDictTab:disabled {
            opacity: .45;
            cursor: not-allowed;
          }
          .tp-wordModalWebFrame {
            position: relative;
            flex: 1 1 auto;
            min-height: 260px;
            overflow: hidden;
            border: 1px solid var(--dsw-alias-border-l1);
            border-radius: 10px;
            background: #ffffff;
          }
          .tp-wordModalWebHost {
            position: absolute;
            inset: 0;
          }
          .tp-wordModalWebview {
            display: flex;
            width: 100%;
            height: 100%;
            border: 0;
            background: #ffffff;
          }
          .tp-wordModalWebPlaceholder {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 24px;
            text-align: center;
            color: var(--dsw-alias-label-secondary);
            font-size: 13px;
            line-height: 1.65;
            background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, #ffffff);
          }
          .tp-wordModalWebNotice {
            position: absolute;
            inset: 0;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 24px;
            text-align: center;
            background: color-mix(in srgb, var(--dsw-alias-bg-base) 86%, transparent);
          }
          .tp-wordModalSpinner {
            width: 22px;
            height: 22px;
            border: 2px solid var(--dsw-alias-border-l2);
            border-top-color: var(--dsw-alias-brand-primary);
            border-radius: 50%;
            animation: tp-spin 800ms linear infinite;
          }
          .tp-wordModalWebText {
            max-width: 460px;
            color: var(--dsw-alias-label-secondary);
            font-size: 12px;
            line-height: 1.6;
          }
          .tp-wordModalWebError {
            max-width: 480px;
            color: var(--dsw-alias-state-error-primary);
            font-size: 12px;
            line-height: 1.6;
          }
          .tp-wordModalWebActions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .tp-wordModalLink {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            padding: 7px 11px;
            border: 1px solid var(--dsw-alias-border-l1);
            border-radius: 8px;
            background: var(--dsw-alias-bg-layer-1);
            color: var(--dsw-alias-label-primary);
            font-size: 12px;
            line-height: 1.45;
            text-decoration: none;
          }
          .tp-wordModalLink:hover {
            border-color: var(--dsw-alias-brand-primary);
            color: var(--dsw-alias-brand-primary);
          }
          .tp-wordModalRetry {
            border: none;
            background: transparent;
            color: var(--dsw-alias-brand-primary);
            font: inherit;
            font-size: 12px;
            cursor: pointer;
            padding: 4px 2px;
          }

          /* Dark glass tier for the word lookup modal. The dictionary content itself
             may be a white web page, but every surrounding surface stays dark. */
          .tp-wordModalCard {
            border-color: rgba(255, 255, 255, 0.22);
            border-radius: 18px;
            background:
              linear-gradient(145deg, rgba(28, 43, 64, 0.96), rgba(10, 18, 32, 0.94)) !important;
            color: #f2f6ff;
          }
          .tp-wordModalClose {
            background: rgba(10, 17, 28, 0.58);
            border-color: rgba(255, 255, 255, 0.22);
            color: rgba(244, 247, 248, 0.72);
          }
          .tp-wordModalClose:hover {
            color: #f4f7f8;
            border-color: rgba(216, 199, 163, 0.62);
          }
          .tp-wordModalWord {
            color: #f4f7f8;
          }
          .tp-wordModalPhonetic {
            color: rgba(244, 247, 248, 0.56);
          }
          .tp-wordModalMeaning {
            background: rgba(7, 13, 23, 0.56) !important;
            border-color: rgba(255, 255, 255, 0.16) !important;
            color: #f4f7f8;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10);
          }
          .tp-wordModalStatus {
            color: rgba(244, 247, 248, 0.62);
          }
          .tp-wordModalError,
          .tp-wordModalWebError {
            color: #ffb3b3;
          }
          .tp-wordModalSave {
            border-color: transparent;
            background: #d8c7a3 !important;
            color: #08111f !important;
          }
          .tp-wordModalSave:hover:not(:disabled) {
            background: #e6d6b5 !important;
            border-color: transparent !important;
          }
          .tp-wordModalExternal {
            background: rgba(8, 14, 24, 0.54) !important;
            border-color: rgba(255, 255, 255, 0.20) !important;
            color: #f4f7f8 !important;
          }
          .tp-wordModalExternal:hover:not(:disabled) {
            background: rgba(28, 44, 66, 0.58) !important;
            border-color: rgba(216, 199, 163, 0.64) !important;
            color: #f4f7f8 !important;
          }
          .tp-wordModalDictionary {
            border-top-color: rgba(255, 255, 255, 0.14);
          }
          .tp-wordModalDictTab {
            background: rgba(8, 14, 24, 0.54);
            border-color: rgba(255, 255, 255, 0.18);
            color: rgba(244, 247, 248, 0.78);
          }
          .tp-wordModalDictTab:hover:not(:disabled) {
            border-color: rgba(216, 199, 163, 0.64);
            color: #f4f7f8;
          }
          .tp-wordModalDictTabActive {
            background: rgba(216, 199, 163, 0.16);
            border-color: rgba(216, 199, 163, 0.58);
            color: #e6d6b5;
          }
          .tp-wordModalWebFrame {
            background: #09111d;
            border-color: rgba(255, 255, 255, 0.16);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
          }
          .tp-wordModalWebview {
            background: #09111d;
          }
          .tp-wordModalWebPlaceholder {
            color: rgba(244, 247, 248, 0.58);
            background:
              radial-gradient(110% 80% at 15% 0%, rgba(95, 145, 220, 0.16), transparent 60%),
              linear-gradient(145deg, rgba(18, 30, 46, 0.72), rgba(7, 13, 23, 0.64));
          }
          .tp-wordModalWebNotice {
            background: rgba(7, 13, 23, 0.78);
          }
          .tp-wordModalWebText {
            color: rgba(244, 247, 248, 0.62);
          }
          .tp-wordModalSpinner {
            border-color: rgba(255, 255, 255, 0.16);
            border-top-color: #d8c7a3;
          }
          .tp-wordModalLink {
            background: rgba(8, 14, 24, 0.54);
            border-color: rgba(255, 255, 255, 0.18);
            color: #f4f7f8;
          }
          .tp-wordModalLink:hover {
            border-color: rgba(216, 199, 163, 0.64);
            color: #e6d6b5;
          }
          .tp-wordModalRetry {
            color: #e6d6b5;
          }

          @media (max-width: 920px) {
            .tp-wordModalCard {
              display: flex;
              flex-direction: column;
              height: auto;
              max-height: calc(100vh - 40px);
              overflow: auto;
            }
            .tp-wordModalInfo {
              overflow: visible;
              padding-bottom: 18px;
            }
            .tp-wordModalDictionary {
              flex: 0 0 auto;
              min-height: 360px;
              border-left: 0;
              border-top: 1px solid rgba(255, 255, 255, 0.12);
            }
            .tp-wordModalWebFrame {
              min-height: 320px;
            }
          }

          @media (max-width: 700px) {
            .tp-wordModalLayer { padding: 10px; }
            .tp-wordModalCard {
              width: 100%;
              height: calc(100vh - 20px);
              max-height: calc(100vh - 20px);
            }
            .tp-wordModalSummary { padding: 18px 16px 0; }
            .tp-wordModalDictionary { padding: 0 10px 10px; }
            .tp-wordModalWebFrame { min-height: 220px; }
            .tp-wordModalActions { justify-content: stretch; }
            .tp-wordModalSave,
            .tp-wordModalExternal { flex: 1 1 auto; }
          }
        `

        const COOKIE_CLEANUP_SCRIPT = `
        (function () {
          var KEY = '__dshDictionaryCookieCleanup';
          var KNOWN = [
            '#onetrust-consent-sdk',
            '#onetrust-banner-sdk',
            '#CybotCookiebotDialog',
            '#CybotCookiebotDialogBodyUnderlay',
            '#qc-cmp2-container',
            '#truste-consent-track',
            '[id^="sp_message_container_"]',
            '[class*="cookie-banner" i]',
            '[class*="cookie-consent" i]',
            '[class*="consent-banner" i]',
            '[id*="cookie-banner" i]',
            '[id*="cookie-consent" i]',
            '[aria-label*="cookie" i]',
            '[aria-label*="consent" i]'
          ];

          if (typeof window[KEY] === 'function') {
            window[KEY]();
            return;
          }

          function isBanner(element) {
            if (!(element instanceof HTMLElement)) return false;
            var style = window.getComputedStyle(element);
            var position = style.position;
            var zIndex = parseInt(style.zIndex || '0', 10);
            return position === 'fixed'
              || position === 'sticky'
              || element.getAttribute('role') === 'dialog'
              || element.getAttribute('aria-modal') === 'true'
              || (!isNaN(zIndex) && zIndex >= 100);
          }

          function hide(element) {
            if (element.getAttribute('data-dsh-cookie-hidden') === '1') return;
            element.setAttribute('data-dsh-cookie-hidden', '1');
            element.style.setProperty('display', 'none', 'important');
            element.style.setProperty('visibility', 'hidden', 'important');
            element.style.setProperty('pointer-events', 'none', 'important');
          }

          function cleanup() {
            var known = document.querySelectorAll(KNOWN.join(','));
            for (var i = 0; i < known.length; i += 1) hide(known[i]);

            var candidates = document.querySelectorAll('[id],[class],[aria-label]');
            for (var j = 0; j < candidates.length; j += 1) {
              var element = candidates[j];
              if (element === document.body || element === document.documentElement) continue;
              var fingerprint = String(element.id || '') + ' '
                + String(element.getAttribute('class') || '') + ' '
                + String(element.getAttribute('aria-label') || '');
              if (!/(cookie|consent|gdpr|privacy)/i.test(fingerprint)) continue;
              if (isBanner(element)) hide(element);
            }

            if (document.documentElement) document.documentElement.style.removeProperty('overflow');
            if (document.body) document.body.style.removeProperty('overflow');
          }

          window[KEY] = cleanup;
          cleanup();

          var scheduled = false;
          var observer = new MutationObserver(function () {
            if (scheduled) return;
            scheduled = true;
            window.setTimeout(function () {
              scheduled = false;
              cleanup();
            }, 80);
          });
          observer.observe(document.documentElement || document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'id', 'style', 'aria-label']
          });
          window.setTimeout(function () {
            observer.disconnect();
          }, 15000);
        })();
        `

        function DictionaryFallbackLink(props) {
          const { href, label } = props
          if (href === null) return null
          return h(
            'a',
            {
              className: 'tp-wordModalLink',
              href,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            label,
          )
        }

        function WordModal(props) {
          const { data, t, onClose, onSave, onRetry } = props
          const closeRef = useRef(null)
          const webviewHostRef = useRef(null)
          const onCloseRef = useRef(onClose)
          const [dictionary, setDictionary] = useState({
            provider: null,
            url: null,
            loading: false,
            error: null,
            nonce: 0,
          })

          useEffect(() => {
            const onKeyDown = (event) => {
              if (event.key === 'Escape') onClose()
            }
            window.addEventListener('keydown', onKeyDown)
            return () => window.removeEventListener('keydown', onKeyDown)
          }, [onClose])

          useEffect(() => {
            onCloseRef.current = onClose
          }, [onClose])

          useEffect(() => {
            closeRef.current?.focus()
          }, [])

          useEffect(() => {
            setDictionary({
              provider: null,
              url: null,
              loading: false,
              error: null,
              nonce: 0,
            })
          }, [data.key])

          useEffect(() => {
            const host = webviewHostRef.current
            if (host === null || dictionary.url === null) return undefined

            const bridge = window.dshDesktop?.browser
            if (
              bridge === undefined
              || bridge === null
              || typeof bridge.acquire !== 'function'
              || typeof bridge.release !== 'function'
            ) {
              setDictionary((current) => (
                current.url === null
                  ? current
                  : { ...current, loading: false, error: t('wordDictionaryUnsupported') }
              ))
              return undefined
            }

            let cancelled = false
            let element = null
            let lease = null
            let unsubscribeOpen = null
            const url = dictionary.url

            const fail = (message) => {
              if (cancelled) return
              setDictionary((current) => (
                current.url === null
                  ? current
                  : { ...current, loading: false, error: message || t('wordDictionaryFailed') }
              ))
            }

            const cleanCookies = () => {
              if (cancelled || element === null) return
              element.executeJavaScript(COOKIE_CLEANUP_SCRIPT).catch(() => {})
            }

            const create = async () => {
              try {
                const reservation = await bridge.acquire(DICTIONARY_WORKSPACE_KEY)
                if (cancelled || host === null) {
                  await bridge.release(reservation.lease).catch(() => {})
                  return
                }

                lease = reservation.lease
                element = document.createElement('webview')
                element.className = 'tp-wordModalWebview'
                element.setAttribute('name', reservation.lease)
                element.setAttribute('partition', reservation.partition)
                element.setAttribute('allowpopups', '')
                element.setAttribute('src', `about:blank#${reservation.lease}`)

                const onStart = () => setDictionary((current) => (
                  current.url === null ? current : { ...current, loading: true, error: null }
                ))
                const onStop = () => {
                  setDictionary((current) => (
                    current.url === null ? current : { ...current, loading: false }
                  ))
                  cleanCookies()
                }
                const onFinish = () => {
                  setDictionary((current) => (
                    current.url === null ? current : { ...current, loading: false, error: null }
                  ))
                  cleanCookies()
                }
                const onNavigate = () => cleanCookies()
                const onFail = (event) => {
                  if (event.isMainFrame === false || event.errorCode === -3) return
                  fail(event.errorDescription)
                }
                const onReady = () => {
                  element.removeEventListener('dom-ready', onReady)
                  element.loadURL(url).then(cleanCookies).catch((error) => {
                    if (!cancelled) fail(error?.message)
                  })
                }

                element.addEventListener('did-start-loading', onStart)
                element.addEventListener('did-stop-loading', onStop)
                element.addEventListener('did-finish-load', onFinish)
                element.addEventListener('did-fail-load', onFail)
                element.addEventListener('did-navigate', onNavigate)
                element.addEventListener('did-navigate-in-page', onNavigate)
                element.addEventListener('dom-ready', onReady)
                element.addEventListener('render-process-gone', () => fail(t('wordDictionaryFailed')))
                element.addEventListener('before-input-event', (event) => {
                  if (event.key !== 'Escape' || event.isAutoRepeat) return
                  event.preventDefault()
                  onCloseRef.current()
                })
                if (typeof bridge.onOpenRequested === 'function') {
                  unsubscribeOpen = bridge.onOpenRequested(reservation.lease, (target) => {
                    if (cancelled || element === null) return
                    setDictionary((current) => (
                      current.url === null ? current : { ...current, loading: true, error: null }
                    ))
                    element.loadURL(target).catch((error) => {
                      if (!cancelled) fail(error?.message)
                    })
                  })
                }

                host.append(element)
              } catch (error) {
                if (!cancelled) fail(error?.message)
              }
            }

            void create()

            return () => {
              cancelled = true
              if (unsubscribeOpen !== null) unsubscribeOpen()
              if (element !== null) element.remove()
              if (lease !== null) {
                void bridge.release(lease).catch(() => {})
              }
            }
          }, [dictionary.url, dictionary.nonce, t])

          const longmanUrl = dictionaryUrl('longman', data.word)
          const oxfordUrl = dictionaryUrl('oxford', data.word)
          const providers = [
            { id: 'longman', label: t('wordLongman'), url: longmanUrl },
            { id: 'oxford', label: t('wordOxford'), url: oxfordUrl },
          ]

          function selectDictionary(provider, url) {
            if (url === null) return
            setDictionary({
              provider,
              url,
              loading: true,
              error: null,
              nonce: 0,
            })
          }

          function retryDictionary() {
            if (dictionary.url === null) return
            setDictionary((current) => ({
              ...current,
              loading: true,
              error: null,
              nonce: current.nonce + 1,
            }))
          }

          function openInBrowser() {
            if (dictionary.url === null) return
            window.open(dictionary.url, '_blank', 'noopener,noreferrer')
            onClose()
          }

          return h(
            'div',
            {
              className: 'tp-wordModalLayer',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': data.word,
              onClick: onClose,
            },
            h('div', { className: 'tp-wordModalBackdrop', 'aria-hidden': true }),
            h(
              'section',
              {
                className: 'tp-wordModalCard',
                onClick: (event) => event.stopPropagation(),
              },
              h('style', null, WORD_MODAL_CSS),
              h(
                'button',
                {
                  ref: closeRef,
                  className: 'tp-wordModalClose',
                  type: 'button',
                  'aria-label': t('wordClose'),
                  title: t('wordClose'),
                  onClick: onClose,
                },
                '×',
              ),
              h(
                'div',
                { className: 'tp-wordModalSummary' },
                h('h2', { className: 'tp-wordModalWord' }, data.word),
                typeof data.phonetic === 'string' && data.phonetic.trim().length > 0
                  ? h('p', { className: 'tp-wordModalPhonetic' }, data.phonetic)
                  : null,
                h(
                  'div',
                  { className: 'tp-wordModalActions' },
                  h(
                    'button',
                    {
                      className: 'tp-btn tp-wordModalSave',
                      type: 'button',
                      disabled: data.status !== 'ready' || data.saving || data.saved,
                      onClick: onSave,
                    },
                    data.saved ? t('wordSaved') : data.saving ? t('wordSaving') : t('wordSave'),
                  ),
                  h(
                    'button',
                    {
                      className: 'tp-btn tp-wordModalExternal',
                      type: 'button',
                      disabled: dictionary.url === null,
                      title: dictionary.url === null
                        ? t('wordSelectDictionary')
                        : t('wordOpenExternal'),
                      onClick: openInBrowser,
                    },
                    t('wordOpenExternal'),
                  ),
                ),
              ),
              h(
                'div',
                { className: 'tp-wordModalInfo' },
                data.status === 'loading'
                  ? h('p', { className: 'tp-wordModalStatus' }, t('wordLookingUp'))
                  : data.status === 'error'
                    ? h(
                        React.Fragment,
                        null,
                        h('p', { className: 'tp-wordModalError' }, data.error || t('wordLookupFailed')),
                        h(
                          'button',
                          { className: 'tp-wordModalRetry', type: 'button', onClick: onRetry },
                          t('wordRetry'),
                        ),
                      )
                    : h(
                        React.Fragment,
                        null,
                        h(
                          'section',
                          { className: 'tp-wordModalSection' },
                          h('h3', { className: 'tp-wordModalSectionTitle' }, t('wordContextMeaning')),
                          h('p', { className: 'tp-wordModalMeaning' }, data.meaning || t('wordNoMeaning')),
                        ),
                        h(
                          'section',
                          { className: 'tp-wordModalSection' },
                          h('h3', { className: 'tp-wordModalSectionTitle' }, t('wordDefinition')),
                          h('p', { className: 'tp-wordModalBodyText' }, data.definition || t('wordNoDefinition')),
                        ),
                        h(
                          'section',
                          { className: 'tp-wordModalSection' },
                          h('h3', { className: 'tp-wordModalSectionTitle' }, t('wordCollocations')),
                          Array.isArray(data.collocations) && data.collocations.length > 0
                            ? h(
                                'ul',
                                { className: 'tp-wordModalCollocations' },
                                data.collocations.map((item, itemIndex) => h('li', { key: itemIndex }, item)),
                              )
                            : h('p', { className: 'tp-wordModalBodyText' }, t('wordNoCollocations')),
                        ),
                        h(
                          'section',
                          { className: 'tp-wordModalSection' },
                          h('h3', { className: 'tp-wordModalSectionTitle' }, t('wordEtymology')),
                          h('p', { className: 'tp-wordModalBodyText' }, data.etymology || t('wordNoEtymology')),
                        ),
                      ),
                data.saveError
                  ? h('p', { className: 'tp-wordModalError' }, data.saveError)
                  : null,
              ),
              h(
                'div',
                { className: 'tp-wordModalDictionary' },
                h(
                  'div',
                  { className: 'tp-wordModalDictTabs' },
                  providers.map((provider) => h(
                    'button',
                    {
                      key: provider.id,
                      className: dictionary.provider === provider.id
                        ? 'tp-wordModalDictTab tp-wordModalDictTabActive'
                        : 'tp-wordModalDictTab',
                      type: 'button',
                      disabled: provider.url === null,
                      onClick: () => selectDictionary(provider.id, provider.url),
                    },
                    provider.label,
                  )),
                ),
                h(
                  'div',
                  { className: 'tp-wordModalWebFrame' },
                  dictionary.url === null
                    ? h(
                        'div',
                        { className: 'tp-wordModalWebPlaceholder' },
                        h('div', null, t('wordDictionaryHint')),
                      )
                    : h('div', {
                        ref: webviewHostRef,
                        className: 'tp-wordModalWebHost',
                      }),
                  dictionary.loading
                    ? h(
                        'div',
                        { className: 'tp-wordModalWebNotice' },
                        h('div', { className: 'tp-wordModalSpinner' }),
                        h('div', { className: 'tp-wordModalWebText' }, t('wordDictionaryLoading')),
                      )
                    : null,
                  dictionary.error
                    ? h(
                        'div',
                        { className: 'tp-wordModalWebNotice' },
                        h('div', { className: 'tp-wordModalWebError' }, dictionary.error),
                        h(
                          'div',
                          { className: 'tp-wordModalWebActions' },
                          h(
                            'button',
                            { className: 'tp-wordModalRetry', type: 'button', onClick: retryDictionary },
                            t('wordDictionaryRetry'),
                          ),
                          h(DictionaryFallbackLink, {
                            href: dictionary.url,
                            label: t('wordOpenExternal'),
                          }),
                        ),
                      )
                    : null,
                ),
              ),
            ),
          )
        }

        module.exports = { WordModal }

      },
      "typing/article-import.js": function (module, exports, require) {
        const SUPPORTED_EXTENSIONS = new Set(['txt', 'docx'])
        const MAX_FILE_BYTES = 20 * 1024 * 1024
        const MIN_ARTICLE_CHARS = 20

        class ImportArticleError extends Error {
          constructor(code, message) {
            super(message)
            this.name = 'ImportArticleError'
            this.code = code
          }
        }

        function extensionOf(filename) {
          const match = /\.([^.\\/]+)$/.exec(String(filename))
          return match === null ? '' : match[1].toLowerCase()
        }

        function normalizeArticleText(value) {
          return String(value ?? '')
            .replace(/^\uFEFF/, '')
            .replace(/\r\n?/g, '\n')
            .replace(/^[ \t]+/gm, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]{2,}/g, ' ')
            .trim()
        }

        function assertArticleText(text) {
          if (text.length < MIN_ARTICLE_CHARS) {
            throw new ImportArticleError(
              'TEXT_TOO_SHORT',
              '没有提取到足够的英文文本，请检查文件内容或改用粘贴导入。',
            )
          }
          return text
        }

        function validateImportFile(file) {
          if (file === null || file === undefined) {
            throw new ImportArticleError('NO_FILE', '请先选择一个文件。')
          }
          const extension = extensionOf(file.name)
          if (extension === 'doc' || extension === 'pdf') {
            throw new ImportArticleError(
              'UNSUPPORTED_DOCUMENT',
              '请另存为 .docx 或 .txt 后再上传。',
            )
          }
          if (!SUPPORTED_EXTENSIONS.has(extension)) {
            throw new ImportArticleError('UNSUPPORTED_TYPE', '仅支持 .txt 和 .docx 文件。')
          }
          if (typeof file.size === 'number' && file.size > MAX_FILE_BYTES) {
            throw new ImportArticleError('FILE_TOO_LARGE', '文件超过 20 MB，请选择更小的文件。')
          }
          return extension
        }

        function titleFromFile(filename) {
          const name = String(filename ?? '').replace(/\.[^.]+$/, '').trim()
          return name.length === 0 ? 'Imported Article' : name.slice(0, 120)
        }

        function sentenceSegments(text) {
          const normalized = String(text).replace(/\s+/g, ' ').trim()
          if (normalized.length === 0) return []
          try {
            if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
              return Array.from(
                new Intl.Segmenter('en', { granularity: 'sentence' }).segment(normalized),
                (part) => part.segment.trim(),
              ).filter(Boolean)
            }
          } catch {
            // Fall through to the punctuation splitter.
          }
          return (normalized.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [normalized])
            .map((sentence) => sentence.trim())
            .filter(Boolean)
        }

        function groupSentences(sentences, size = 3) {
          const groups = []
          for (let index = 0; index < sentences.length; index += size) {
            groups.push(sentences.slice(index, index + size).join(' '))
          }
          return groups
        }

        function paragraphsFromBody(body) {
          const normalized = String(body).trim()
          if (normalized.length === 0) return []
          const blocks = normalized.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)
          if (blocks.length > 1) return blocks
          const sentences = sentenceSegments(normalized)
          if (sentences.length <= 3) return [normalized]
          return groupSentences(sentences, 3)
        }

        function detectTitle(text) {
          const lines = String(text).split(/\n/).map((line) => line.trim()).filter(Boolean)
          if (lines.length < 2) return null
          const first = lines[0]
            .replace(/^#{1,6}\s*/, '')
            .replace(/^(?:title|题目)\s*[:：]\s*/i, '')
            .replace(/^["“”']+|["“”']+$/g, '')
            .trim()
          if (first.length === 0 || first.length > 120) return null
          const words = first.split(/\s+/).filter(Boolean)
          if (words.length > 14) return null
          if (/[.!?。！？]$/.test(first) && words.length > 8) return null
          return first
        }

        /**
         * Detect a leading title and turn the remaining text into readable paragraphs.
         * Blank-line blocks win; a single dense block is grouped into 3-sentence paragraphs.
         */
        function structureArticleText(raw, fallbackTitle) {
          const normalized = normalizeArticleText(raw)
          const detected = detectTitle(normalized)
          let title = typeof fallbackTitle === 'string' && fallbackTitle.trim().length > 0
            ? fallbackTitle.trim().slice(0, 120)
            : 'Imported Article'
          let body = normalized

          if (detected !== null) {
            const firstBreak = normalized.indexOf('\n')
            if (firstBreak !== -1) {
              title = detected
              body = normalized.slice(firstBreak + 1).trim()
            }
          }

          const paragraphs = paragraphsFromBody(body)
          return {
            title,
            paragraphs,
            text: paragraphs.join('\n\n'),
          }
        }

        function mammothRuntime() {
          const runtime = typeof window !== 'undefined' ? window.mammoth : undefined
          if (runtime === undefined || typeof runtime.extractRawText !== 'function') {
            throw new ImportArticleError(
              'DOCX_UNAVAILABLE',
              '当前构建未包含 .docx 解析组件。请先用粘贴导入，或安装 mammoth 后重新构建。',
            )
          }
          return runtime
        }

        async function extractArticleFile(file) {
          const extension = validateImportFile(file)

          try {
            if (extension === 'txt') {
              return assertArticleText(normalizeArticleText(await file.text()))
            }

            const mammoth = mammothRuntime()
            const arrayBuffer = await file.arrayBuffer()
            const result = await mammoth.extractRawText({ arrayBuffer })
            return assertArticleText(normalizeArticleText(result?.value ?? ''))
          } catch (error) {
            if (error instanceof ImportArticleError) throw error
            throw new ImportArticleError(
              'FILE_PARSE_FAILED',
              `读取文件失败：${error?.message || '未知错误'}`,
            )
          }
        }

        module.exports = {
          ImportArticleError,
          MAX_FILE_BYTES,
          MIN_ARTICLE_CHARS,
          assertArticleText,
          extractArticleFile,
          extensionOf,
          normalizeArticleText,
          paragraphsFromBody,
          structureArticleText,
          titleFromFile,
          validateImportFile,
        }

      },
      "typing/dictionary-session.js": function (module, exports, require) {
        const DICTIONARY_WORKSPACE_KEY = 'typing-practice-dictionary'
        const DICTIONARY_ORIGINS = [
          'https://www.ldoceonline.com',
          'https://www.oxfordlearnersdictionaries.com',
        ]

        let warmPromise

        function preconnectDictionaryOrigins() {
          if (typeof document === 'undefined' || document.head === null) return
          const add = (origin, rel) => {
            const existing = document.head.querySelector(
              `link[data-typing-dictionary="${origin}"][rel="${rel}"]`,
            )
            if (existing !== null) return
            const link = document.createElement('link')
            link.rel = rel
            link.href = origin
            link.dataset.typingDictionary = origin
            document.head.append(link)
          }
          for (const origin of DICTIONARY_ORIGINS) {
            add(origin, 'preconnect')
            add(origin, 'dns-prefetch')
          }
        }

        function prewarmDictionarySession() {
          if (warmPromise !== undefined) return warmPromise
          const bridge = window.dshDesktop?.browser
          if (
            bridge === undefined
            || bridge === null
            || typeof bridge.acquire !== 'function'
            || typeof bridge.release !== 'function'
          ) {
            return Promise.resolve()
          }

          warmPromise = (async () => {
            const reservation = await bridge.acquire(DICTIONARY_WORKSPACE_KEY)
            await bridge.release(reservation.lease)
          })().catch(() => {
            warmPromise = undefined
          })
          return warmPromise
        }

        module.exports = {
          DICTIONARY_WORKSPACE_KEY,
          DICTIONARY_ORIGINS,
          preconnectDictionaryOrigins,
          prewarmDictionarySession,
        }

      },
      "typing/favorite-actions.js": function (module, exports, require) {
        const { React, h } = require('../shared.js')

            function FavoriteButton(props) {
              const { saved, busy, label, t, onCollect } = props
              const text = saved ? t('favoriteSaved') : busy ? t('favoriteSaving') : label || t('favoriteAddSentence')
              return h(
                'button',
                {
                  className: saved ? 'tp-btn tp-btnSmall tp-favBtnSaved' : 'tp-btn tp-btnSmall',
                  type: 'button',
                  disabled: saved === true || busy === true,
                  title: text,
                  onClick: onCollect,
                },
                saved === true ? '★' : '☆',
                h('span', null, text),
              )
            }
            function SelectionChip(props) {
              const { menu, t, onOpen, onPick, onClose } = props
              const style = { left: `${menu.x}px`, top: `${menu.y}px` }
              const act = (action) => (event) => {
                event.preventDefault()
                event.stopPropagation()
                action()
              }

              if (menu.mode !== 'pick') {
                return h(
                  'div',
                  { className: 'tp-favFloat', style },
                  h(
                    'button',
                    {
                      className: 'tp-btn tp-btnSmall',
                      type: 'button',
                      onMouseDown: act(onOpen),
                    },
                    '☆ ',
                    t('favoriteAdd'),
                  ),
                )
              }

              return h(
                'div',
                { className: 'tp-favFloat', style },
                h('span', { className: 'tp-favPickLabel' }, t('favoritePickType')),
                h(
                  'button',
                  { className: 'tp-btn tp-btnSmall', type: 'button', onMouseDown: act(() => onPick('word')) },
                  t('favoriteTypeWord'),
                ),
                h(
                  'button',
                  { className: 'tp-btn tp-btnSmall', type: 'button', onMouseDown: act(() => onPick('sentence')) },
                  t('favoriteTypeSentence'),
                ),
                h('button', { className: 'tp-favCancel', type: 'button', onMouseDown: act(onClose) }, t('favoriteCancel')),
              )
            }

        module.exports = { FavoriteButton, SelectionChip }

      },
      "typing/index.js": function (module, exports, require) {
        const {
          React, h, useCallback, useEffect, useMemo, useRef, useState,
          requestJson, useT,
        } = require('../shared.js')
        const { QuizDrawer, assertQuizPayload } = require('./quiz.js')
        const { FavoriteButton, SelectionChip } = require('./favorite-actions.js')
        const { ImportArticleModal } = require('./ImportArticleModal.js')
        const { WordModal } = require('./WordModal.js')
        const { ReadingAnalysisModal } = require('./ReadingAnalysisModal.js')
        const { preconnectDictionaryOrigins, prewarmDictionarySession } = require('./dictionary-session.js')
        const { tokenizeSentence, wordCacheKey } = require('./word-lookup.js')

            const DEFAULT_ARTICLE = {
              title: 'The Quiet Power of Practice',
              text: [
                'Practice is not a single heroic effort, but a habit built from small, repeated choices.',
                'When you type an English sentence slowly and correctly, your fingers begin to remember the shape of the language.',
                'Mistakes are useful because they show exactly where your attention needs to go.',
                'A short session every day is more valuable than a long session once a month.',
                'The goal is not speed at first, but accuracy and confidence.',
                'With patience, the awkward pauses disappear and the words begin to flow.',
              ].join(' '),
            }
            function splitSentences(text) {
              const normalized = String(text).replace(/\s+/g, ' ').trim()
              if (normalized.length === 0) return []
              try {
                if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
                  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' })
                  return Array.from(segmenter.segment(normalized), (part) => part.segment.trim()).filter(Boolean)
                }
              } catch {
                // Fall through to the simple splitter.
              }
              return (normalized.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [normalized])
                .map((sentence) => sentence.trim())
                .filter(Boolean)
            }
            function normalizeReadingTopic(value) {
              if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                const category = typeof value.category === 'string' ? value.category.trim() : ''
                const subcategory = typeof value.subcategory === 'string' ? value.subcategory.trim() : ''
                return category.length > 0 && subcategory.length > 0
                  ? { category, subcategory }
                  : null
              }
              const parts = String(value ?? '').split('/').map((part) => part.trim()).filter(Boolean)
              if (parts.length === 0) return null
              return parts.length === 1
                ? { category: '社会热点', subcategory: parts[0] }
                : { category: parts[0], subcategory: parts.slice(1).join('/') }
            }

            function assertReadingPayload(value) {
              if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                throw new Error('精读数据不是对象。')
              }
              if (!Array.isArray(value.topics) || value.topics.length < 3 || value.topics.length > 6) {
                throw new Error('精读标签必须是 3–6 个。')
              }
              if (!Array.isArray(value.vocabulary) || value.vocabulary.length > 5) {
                throw new Error('重点词汇不能超过 5 个。')
              }
              const vocabulary = value.vocabulary.map((item) => {
                if (item === null || typeof item !== 'object' || Array.isArray(item)) {
                  throw new Error('词汇条目无效。')
                }
                const word = typeof item.word === 'string' ? item.word.trim() : ''
                const pos = typeof item.pos === 'string' ? item.pos.trim() : ''
                const meaning = typeof item.meaning === 'string' ? item.meaning.trim() : ''
                if (word.length === 0 || pos.length === 0 || meaning.length === 0) {
                  throw new Error('词汇条目缺少单词、词性或释义。')
                }
                return {
                  word,
                  pos,
                  meaning,
                  is_writing_vocab: item.is_writing_vocab === true,
                }
              })
              if (!Array.isArray(value.good_sentences) || value.good_sentences.length < 1 || value.good_sentences.length > 3) {
                throw new Error('好句必须是 1–3 句。')
              }
              const goodSentences = value.good_sentences.map((item) => {
                if (item === null || typeof item !== 'object' || Array.isArray(item)) {
                  throw new Error('好句条目无效。')
                }
                const sentence = typeof item.sentence === 'string' ? item.sentence.trim() : ''
                const analysis = typeof item.analysis === 'string' ? item.analysis.trim() : ''
                if (sentence.length === 0 || analysis.length === 0) {
                  throw new Error('好句缺少句子或解析。')
                }
                if (!Array.isArray(item.embedded_phrases) || item.embedded_phrases.length === 0) {
                  throw new Error('好句缺少内嵌短语。')
                }
                const embeddedPhrases = item.embedded_phrases.map((phrase) => {
                  const text = typeof phrase?.phrase === 'string' ? phrase.phrase.trim() : ''
                  const meaning = typeof phrase?.meaning === 'string' ? phrase.meaning.trim() : ''
                  if (text.length === 0 || meaning.length === 0) throw new Error('内嵌短语无效。')
                  return { phrase: text, meaning }
                })
                return { sentence, analysis, embedded_phrases: embeddedPhrases }
              })
              const seenTopics = new Set()
              const topics = []
              for (const raw of value.topics) {
                const topic = normalizeReadingTopic(raw)
                if (topic === null) continue
                const key = `${topic.category}\u0000${topic.subcategory}`
                if (seenTopics.has(key)) continue
                seenTopics.add(key)
                topics.push(topic)
              }
              if (topics.length < 3 || topics.length > 6) {
                throw new Error('精读标签必须是 3–6 个。')
              }
              return { topics, vocabulary, good_sentences: goodSentences }
            }

            function sourceSentenceFor(text, word) {
              const sentences = splitSentences(text)
              const target = String(word).toLowerCase()
              const found = sentences.find((sentence) => sentence.toLowerCase().includes(target))
              return found ?? ''
            }

            function countErrors(target, typed) {
              const expected = Array.from(target)
              const actual = Array.from(typed)
              let count = 0
              for (let index = 0; index < Math.min(expected.length, actual.length); index += 1) {
                if (expected[index] !== actual[index]) count += 1
              }
              if (actual.length > expected.length) count += actual.length - expected.length
              return count
            }
            function SentenceText(props) {
              const { text, typed, active, sentence, onWordClick } = props
              const actual = active ? Array.from(typed ?? '') : []
              const tokens = tokenizeSentence(text)

              const renderCharacters = (value, start) => Array.from(value).map((character, offset) => {
                const index = start + offset
                const wrong = active && index < actual.length && actual[index] !== character
                return h(
                  'span',
                  {
                    key: `c${index}`,
                    className: wrong ? 'tp-char tp-charError' : 'tp-char',
                  },
                  character,
                )
              })

              return h(
                React.Fragment,
                null,
                tokens.map((token, index) => {
                  if (token.type === 'text') {
                    return h(
                      React.Fragment,
                      { key: `t${index}` },
                      renderCharacters(token.value, token.start),
                    )
                  }
                  return h(
                    'span',
                    {
                      key: `w${index}`,
                      className: 'tp-word',
                      onClick: (event) => {
                        const selection = window.getSelection()
                        if (selection !== null && !selection.isCollapsed) return
                        event.stopPropagation()
                        if (typeof onWordClick === 'function') {
                          onWordClick(token.value, sentence, event)
                        }
                      },
                    },
                    renderCharacters(token.value, token.start),
                  )
                }),
              )
            }
            function EngineBadge(props) {
              const { engine, t } = props
              if (engine.state === 'ready') {
                return h(
                  'div',
                  { className: 'tp-engine', title: `${engine.provider.id} / ${engine.model}` },
                  h('span', { className: 'tp-dot tp-dot-ok' }),
                  h(
                    'span',
                    { className: 'tp-engineText' },
                    h('strong', null, engine.provider.name || 'DeepSeek'),
                    h('span', { className: 'tp-engineMeta' }, `${engine.provider.id} / ${engine.model}`),
                  ),
                )
              }

              const failed = engine.state === 'error'
              return h(
                'div',
                { className: 'tp-engine', title: failed ? engine.message : '' },
                h('span', { className: failed ? 'tp-dot tp-dot-error' : 'tp-dot tp-dot-pending' }),
                h('span', { className: 'tp-engineText' }, failed ? t('engineErrorShort') : t('engineChecking')),
              )
            }
            function TranslationCard(props) {
              const { record, t, onRetry } = props
              if (record === null) {
                return h('p', { className: 'tp-placeholder' }, t('translationPlaceholder'))
              }

              return h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'tp-recordHead' },
                  h('span', { className: 'tp-chip' }, `${t('sentenceLabel')} ${record.index + 1}`),
                  record.status === 'pending'
                    ? h('span', { className: 'tp-recordStatus' }, t('translating'))
                    : null,
                  record.status === 'done'
                    ? h(FavoriteButton, {
                        saved: props.saved,
                        busy: props.busy,
                        t,
                        onCollect: () => props.onCollect(record),
                      })
                    : null,
                ),
                h('p', { className: 'tp-enSmall' }, record.en),
                record.status === 'pending'
                  ? h('div', { className: 'tp-pending' }, t('translating'))
                  : record.status === 'error'
                    ? h(
                        'div',
                        { className: 'tp-alert' },
                        h(
                          'div',
                          { className: 'tp-alertText' },
                          h('div', null, record.error?.message || t('translationFailed')),
                          record.error?.code ? h('div', { className: 'tp-alertHint' }, record.error.code) : null,
                        ),
                        h(
                          'button',
                          { className: 'tp-btn', type: 'button', onClick: () => onRetry(record) },
                          t('retry'),
                        ),
                      )
                    : h('p', { className: 'tp-zh' }, record.zh),
                record.status === 'done' && record.provider
                  ? h(
                      'div',
                      { className: 'tp-providerLine' },
                      `${record.provider.name || 'DeepSeek'} · ${record.provider.id} / ${record.model}`,
                    )
                  : null,
              )
            }
            function RecordRow(props) {
              const { record, t, onRetry } = props
              return h(
                'article',
                { className: 'tp-record' },
                h(
                  'div',
                  { className: 'tp-recordHead' },
                  h('span', { className: 'tp-recordIndex' }, String(record.index + 1).padStart(2, '0')),
                  record.status === 'pending'
                    ? h('span', { className: 'tp-recordStatus' }, t('translating'))
                    : record.status === 'error'
                      ? h('span', { className: 'tp-recordStatus' }, t('failed'))
                      : null,
                  record.status === 'done'
                    ? h(FavoriteButton, {
                        saved: props.saved,
                        busy: props.busy,
                        t,
                        onCollect: () => props.onCollect(record),
                      })
                    : null,
                ),
                h('p', { className: 'tp-recordEn' }, record.en),
                record.status === 'pending'
                  ? h('p', { className: 'tp-recordZh tp-muted' }, t('translating'))
                  : record.status === 'error'
                    ? h(
                        'div',
                        { className: 'tp-recordError' },
                        h('span', null, record.error?.message || t('translationFailed')),
                        h(
                          'button',
                          { className: 'tp-btn tp-btnSmall', type: 'button', onClick: () => onRetry(record) },
                          t('retry'),
                        ),
                      )
                    : h('p', { className: 'tp-recordZh' }, record.zh),
              )
            }
            function PracticeView(props) {
              const {
                ctx,
                embedded = false,
                onFavoriteSaved,
                pendingArticle,
                onPendingArticleConsumed,
                onPracticeStateChange,
              } = props
              const t = useT(ctx)
              const [article, setArticle] = useState(DEFAULT_ARTICLE)
              const paragraphs = useMemo(() => (
                String(article.text)
                  .split(/\n\s*\n/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
              ), [article.text])
              const sentenceGroups = useMemo(() => {
                let start = 0
                return paragraphs.map((paragraph) => {
                  const items = splitSentences(paragraph)
                  const group = { start, items }
                  start += items.length
                  return group
                })
              }, [paragraphs])
              const sentences = useMemo(
                () => sentenceGroups.flatMap((group) => group.items),
                [sentenceGroups],
              )
              const [importOpen, setImportOpen] = useState(false)
              const total = sentences.length
              const [index, setIndex] = useState(0)
              const [typed, setTyped] = useState('')
              const [records, setRecords] = useState([])
              const [hint, setHint] = useState('')
              const [engine, setEngine] = useState({ state: 'checking' })
              const inputRef = useRef(null)
              const listRef = useRef(null)
              const controllersRef = useRef(new Map())
              const lastCommittedRef = useRef(-1)
              const rootRef = useRef(null)
              const [savedKeys, setSavedKeys] = useState({})
              const [savingKeys, setSavingKeys] = useState({})
              const [toast, setToast] = useState(null)
              const [floatMenu, setFloatMenu] = useState(null)
              const [quizOpen, setQuizOpen] = useState(false)
              const [quiz, setQuiz] = useState({
                status: 'idle',
                questions: [],
                error: null,
                provider: null,
                model: null,
                attempts: 0,
              })
              const [answers, setAnswers] = useState({})
              const [submitted, setSubmitted] = useState(false)
              const quizAbortRef = useRef(null)
              const [reading, setReading] = useState({
                status: 'idle',
                data: null,
                error: null,
              })
              const [readingOpen, setReadingOpen] = useState(false)
              const readingAbortRef = useRef(null)
              const [wordPopover, setWordPopover] = useState(null)
              const wordCacheRef = useRef(new Map())
              const wordAbortRef = useRef(new Map())
              const wordCloseTimerRef = useRef(null)
              const wordInputSelectionRef = useRef(null)
              const savedWordKeysRef = useRef(new Set())

              const done = index >= total
              const sentence = done ? '' : sentences[index]
              const latestRecord = records.length > 0 ? records[records.length - 1] : null
              const errors = done ? 0 : countErrors(sentence, typed)
              const extra = done ? 0 : Math.max(0, Array.from(typed).length - Array.from(sentence).length)
              const exact = !done && typed.trimEnd() === sentence
              const progress = total === 0 ? 0 : Math.round((records.length / total) * 100)

              const collect = useCallback(async (payload, key) => {
                if (key !== undefined && savedKeys[key] === true) return
                if (key !== undefined) setSavingKeys((current) => ({ ...current, [key]: true }))
                try {
                  await requestJson('/favorites', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(payload),
                  })
                  if (key !== undefined) setSavedKeys((current) => ({ ...current, [key]: true }))
                  setToast({ tone: 'ok', text: t('favoriteToastSaved') })
                  if (typeof onFavoriteSaved === 'function') onFavoriteSaved()
                } catch (error) {
                  const duplicate = error?.code === 'DUPLICATE_VOCABULARY'
                    || error?.code === 'DUPLICATE_SENTENCE'
                  setToast({
                    tone: duplicate ? 'info' : 'error',
                    text: duplicate
                      ? (error?.message || t('favoriteToastDuplicate'))
                      : `${t('favoriteToastFailed')}${error?.message ?? ''}`,
                  })
                } finally {
                  if (key !== undefined) {
                    setSavingKeys((current) => {
                      const next = { ...current }
                      delete next[key]
                      return next
                    })
                  }
                }
              }, [savedKeys, t])

              useEffect(() => {
                if (toast === null) return undefined
                const timer = window.setTimeout(() => setToast(null), 2400)
                return () => window.clearTimeout(timer)
              }, [toast])

              const collectSentence = useCallback((record) => {
                void collect({
                  type: 'sentence',
                  text: record.en,
                  translation: typeof record.zh === 'string' ? record.zh : '',
                  source: article.title,
                }, `s${record.index}`)
              }, [collect])

              const handleRootMouseUp = useCallback((event) => {
                const target = event?.target
                if (target instanceof Element && target.closest('.tp-favFloat') !== null) return
                const selection = window.getSelection()
                if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
                  setFloatMenu(null)
                  return
                }
                const text = selection.toString().trim()
                if (text.length === 0) {
                  setFloatMenu(null)
                  return
                }
                const range = selection.getRangeAt(0)
                const root = rootRef.current
                if (root === null || !root.contains(range.commonAncestorContainer)) {
                  setFloatMenu(null)
                  return
                }
                const rect = range.getBoundingClientRect()
                if (rect.width === 0 && rect.height === 0) {
                  setFloatMenu(null)
                  return
                }
                setFloatMenu({
                  mode: 'chip',
                  text: text.slice(0, 4000),
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                })
              }, [])

              const pickFavoriteType = useCallback((type) => {
                const menu = floatMenu
                setFloatMenu(null)
                if (menu === null) return
                window.getSelection()?.removeAllRanges()
                void collect({
                  type,
                  text: menu.text,
                  translation: '',
                  source: `${article.title} · ${t('favoriteSelectionSource')}`,
                }, undefined)
              }, [collect, floatMenu, t])

              useEffect(() => {
                let alive = true
                const controller = new AbortController()
                requestJson('/status', { method: 'GET', signal: controller.signal })
                  .then((data) => {
                    if (!alive) return
                    if (data?.ok) {
                      setEngine({ state: 'ready', provider: data.provider, model: data.model })
                    } else {
                      setEngine({
                        state: 'error',
                        message: data?.error?.message || t('engineError'),
                      })
                    }
                  })
                  .catch((error) => {
                    if (!alive || error?.name === 'AbortError') return
                    setEngine({ state: 'error', message: error?.message || t('engineError') })
                  })
                return () => {
                  alive = false
                  controller.abort()
                }
              }, [t])

              useEffect(() => {
                if (!done) inputRef.current?.focus()
              }, [index, done])

              useEffect(() => {
                const list = listRef.current
                if (list !== null) list.scrollTop = list.scrollHeight
              }, [records])

              useEffect(() => {
                preconnectDictionaryOrigins()
                void prewarmDictionarySession()
                return () => {
                  for (const controller of controllersRef.current.values()) controller.abort()
                  controllersRef.current.clear()
                  if (quizAbortRef.current !== null) quizAbortRef.current.abort()
                  if (readingAbortRef.current !== null) readingAbortRef.current.abort()
                  for (const controller of wordAbortRef.current.values()) controller.abort()
                  wordAbortRef.current.clear()
                  if (wordCloseTimerRef.current !== null) {
                    window.clearTimeout(wordCloseTimerRef.current)
                    wordCloseTimerRef.current = null
                  }
                }
              }, [])

              useEffect(() => {
                if (pendingArticle === null || pendingArticle === undefined) return
                applyImportedArticle({
                  title: pendingArticle.title,
                  text: pendingArticle.text,
                })
                if (typeof onPendingArticleConsumed === 'function') {
                  onPendingArticleConsumed(pendingArticle.id)
                }
              }, [pendingArticle?.id])

              const hasTypingPractice = typed.trim().length > 0
                || index > 0
                || records.length > 0
                || article.text !== DEFAULT_ARTICLE.text
                || article.title !== DEFAULT_ARTICLE.title

              useEffect(() => {
                if (typeof onPracticeStateChange === 'function') {
                  onPracticeStateChange(hasTypingPractice)
                }
              }, [hasTypingPractice, onPracticeStateChange])

              const runTranslation = useCallback(async (record) => {
                const previous = controllersRef.current.get(record.index)
                if (previous !== undefined) previous.abort()
                const controller = new AbortController()
                controllersRef.current.set(record.index, controller)

                setRecords((current) => current.map((item) => (
                  item.index === record.index
                    ? { ...item, status: 'pending', zh: '', error: null }
                    : item
                )))

                try {
                  const data = await requestJson('/translate', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ sentence: record.en }),
                    signal: controller.signal,
                  })
                  if (controller.signal.aborted) return
                  setRecords((current) => current.map((item) => (
                    item.index === record.index
                      ? {
                          ...item,
                          status: 'done',
                          zh: data.translation,
                          provider: data.provider,
                          model: data.model,
                          error: null,
                        }
                      : item
                  )))
                  if (data?.provider && data?.model) {
                    setEngine({ state: 'ready', provider: data.provider, model: data.model })
                  }
                } catch (error) {
                  if (controller.signal.aborted || error?.name === 'AbortError') return
                  setRecords((current) => current.map((item) => (
                    item.index === record.index
                      ? {
                          ...item,
                          status: 'error',
                          zh: '',
                          error: {
                            code: error?.code || 'TRANSLATION_FAILED',
                            message: error?.message || t('translationFailed'),
                          },
                        }
                      : item
                  )))
                } finally {
                  if (controllersRef.current.get(record.index) === controller) {
                    controllersRef.current.delete(record.index)
                  }
                }
              }, [t])

              function restoreInputFocus(force = false) {
                const input = inputRef.current
                if (input === null) return
                const active = document.activeElement
                if (!force && active !== null && active !== document.body && active !== input) return
                input.focus()
                const selection = wordInputSelectionRef.current
                if (selection !== null) {
                  const max = input.value.length
                  input.setSelectionRange(
                    Math.min(selection.start, max),
                    Math.min(selection.end, max),
                  )
                }
              }

              function dismissWordLookup(restoreFocus = false) {
                for (const [key, controller] of wordAbortRef.current.entries()) {
                  controller.abort()
                  wordCacheRef.current.delete(key)
                }
                wordAbortRef.current.clear()
                if (wordCloseTimerRef.current !== null) {
                  window.clearTimeout(wordCloseTimerRef.current)
                  wordCloseTimerRef.current = null
                }
                setWordPopover(null)
                if (restoreFocus) window.setTimeout(() => restoreInputFocus(true), 0)
              }

              function openWordPopover(word, sentence, anchor, inputRect) {
                if (wordCloseTimerRef.current !== null) {
                  window.clearTimeout(wordCloseTimerRef.current)
                  wordCloseTimerRef.current = null
                }
                const key = wordCacheKey(word)
                const cached = wordCacheRef.current.get(key)
                if (cached !== undefined) {
                  setWordPopover({
                    key,
                    word,
                    sentence,
                    anchor,
                    inputRect,
                    status: cached.status,
                    meaning: cached.meaning || '',
                    definition: cached.definition || '',
                    collocations: cached.collocations || [],
                    etymology: cached.etymology || '',
                    phonetic: cached.phonetic || '',
                    error: cached.error || null,
                    saving: false,
                    saved: savedWordKeysRef.current.has(key),
                    saveError: null,
                  })
                  return
                }

                const controller = new AbortController()
                const entry = {
                  status: 'loading',
                  meaning: '',
                  definition: '',
                  collocations: [],
                  etymology: '',
                  phonetic: '',
                  error: null,
                }
                wordCacheRef.current.set(key, entry)
                wordAbortRef.current.set(key, controller)
                setWordPopover({
                  key,
                  word,
                  sentence,
                  anchor,
                  inputRect,
                  status: 'loading',
                  meaning: '',
                  definition: '',
                  collocations: [],
                  etymology: '',
                  phonetic: '',
                  error: null,
                  saving: false,
                  saved: savedWordKeysRef.current.has(key),
                  saveError: null,
                })

                void (async () => {
                  try {
                    const data = await requestJson('/word', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ word, sentence }),
                      signal: controller.signal,
                    })
                    if (controller.signal.aborted) return
                    const meaning = typeof data?.meaning === 'string' ? data.meaning.trim() : ''
                    if (meaning.length === 0) throw new Error(t('wordNoMeaning'))
                    const definition = typeof data?.definition === 'string' ? data.definition.trim() : ''
                    const collocations = Array.isArray(data?.collocations)
                      ? data.collocations.filter((item) => typeof item === 'string' && item.trim().length > 0)
                      : []
                    const etymology = typeof data?.etymology === 'string' ? data.etymology.trim() : ''
                    const phonetic = typeof data?.phonetic === 'string' ? data.phonetic.trim() : ''
                    entry.status = 'ready'
                    entry.meaning = meaning
                    entry.definition = definition
                    entry.collocations = collocations
                    entry.etymology = etymology
                    entry.phonetic = phonetic
                    setWordPopover((current) => (
                      current !== null && current.key === key
                        ? {
                            ...current,
                            status: 'ready',
                            meaning,
                            definition,
                            collocations,
                            etymology,
                            phonetic,
                            error: null,
                          }
                        : current
                    ))
                  } catch (error) {
                    if (controller.signal.aborted) return
                    const message = error?.message || t('wordLookupFailed')
                    entry.status = 'error'
                    entry.error = message
                    setWordPopover((current) => (
                      current !== null && current.key === key
                        ? { ...current, status: 'error', error: message }
                        : current
                    ))
                  } finally {
                    if (wordAbortRef.current.get(key) === controller) {
                      wordAbortRef.current.delete(key)
                    }
                  }
                })()
              }

              function handleWordClick(word, sentence, event) {
                const selection = window.getSelection()
                if (selection !== null && !selection.isCollapsed) return
                event.stopPropagation()
                const input = inputRef.current
                if (input !== null) {
                  wordInputSelectionRef.current = {
                    start: input.selectionStart,
                    end: input.selectionEnd,
                  }
                  input.blur()
                }
                const rect = event.currentTarget.getBoundingClientRect()
                const inputRect = input === null ? null : input.getBoundingClientRect()
                openWordPopover(
                  word,
                  sentence,
                  { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
                  inputRect === null
                    ? null
                    : {
                        left: inputRect.left,
                        right: inputRect.right,
                        top: inputRect.top,
                        bottom: inputRect.bottom,
                      },
                )
              }

              function retryWordLookup() {
                if (wordPopover === null) return
                wordCacheRef.current.delete(wordPopover.key)
                openWordPopover(
                  wordPopover.word,
                  wordPopover.sentence,
                  wordPopover.anchor,
                  wordPopover.inputRect,
                )
              }

              async function saveWord() {
                const current = wordPopover
                if (
                  current === null
                  || current.status !== 'ready'
                  || current.saving
                  || current.saved
                ) {
                  return
                }

                setWordPopover((state) => (
                  state !== null && state.key === current.key
                    ? { ...state, saving: true, saveError: null }
                    : state
                ))

                try {
                  await requestJson('/favorites', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                      type: 'vocabulary',
                      text: current.word,
                      translation: current.meaning,
                      source: current.sentence,
                    }),
                  })
                  savedWordKeysRef.current.add(current.key)
                  if (typeof onFavoriteSaved === 'function') onFavoriteSaved()
                  setToast({ tone: 'ok', text: t('favoriteToastSaved') })
                  setWordPopover((state) => (
                    state !== null && state.key === current.key
                      ? { ...state, saving: false, saved: true, saveError: null }
                      : state
                  ))
                  if (wordCloseTimerRef.current !== null) {
                    window.clearTimeout(wordCloseTimerRef.current)
                  }
                  wordCloseTimerRef.current = window.setTimeout(() => {
                    setWordPopover((state) => (
                      state !== null && state.key === current.key ? null : state
                    ))
                    restoreInputFocus(true)
                    wordCloseTimerRef.current = null
                  }, 650)
                } catch (error) {
                  const message = error?.message || t('wordSaveFailed')
                  setWordPopover((state) => (
                    state !== null && state.key === current.key
                      ? { ...state, saving: false, saveError: message }
                      : state
                  ))
                }
              }

              const generateQuiz = useCallback(async () => {
                const previous = quizAbortRef.current
                if (previous !== null) previous.abort()
                const controller = new AbortController()
                quizAbortRef.current = controller

                setQuizOpen(true)
                setSubmitted(false)
                setAnswers({})
                setQuiz({
                  status: 'loading',
                  questions: [],
                  error: null,
                  provider: null,
                  model: null,
                  attempts: 0,
                })

                try {
                  const data = await requestJson('/quiz', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ title: article.title, text: article.text }),
                    signal: controller.signal,
                  })
                  if (controller.signal.aborted) return
                  const questions = assertQuizPayload(data?.questions)
                  setQuiz({
                    status: 'ready',
                    questions,
                    error: null,
                    provider: data?.provider || null,
                    model: data?.model || null,
                    attempts: data?.attempts || 1,
                  })
                  if (data?.provider && data?.model) {
                    setEngine({ state: 'ready', provider: data.provider, model: data.model })
                  }
                } catch (error) {
                  if (controller.signal.aborted || error?.name === 'AbortError') return
                  setQuiz({
                    status: 'error',
                    questions: [],
                    error: {
                      code: error?.code || 'QUIZ_FAILED',
                      message: error?.message || t('quizError'),
                    },
                    provider: null,
                    model: null,
                    attempts: 0,
                  })
                } finally {
                  if (quizAbortRef.current === controller) quizAbortRef.current = null
                }
              }, [t])

              const generateReading = useCallback(async () => {
                if (readingAbortRef.current !== null) readingAbortRef.current.abort()
                const controller = new AbortController()
                readingAbortRef.current = controller
                setReadingOpen(true)
                setReading({ status: 'loading', data: null, error: null })
                try {
                  const data = await requestJson('/reading/analyze', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ title: article.title, text: article.text }),
                    signal: controller.signal,
                  })
                  if (controller.signal.aborted) return
                  setReading({ status: 'ready', data: assertReadingPayload(data?.analysis), error: null })
                } catch (error) {
                  if (controller.signal.aborted || error?.name === 'AbortError') return
                  setReading({
                    status: 'error',
                    data: null,
                    error: {
                      code: error?.code || 'READING_FAILED',
                      message: error?.message || t('readingError'),
                    },
                  })
                } finally {
                  if (readingAbortRef.current === controller) readingAbortRef.current = null
                }
              }, [article.title, article.text, t])

              const openReading = useCallback(() => {
                if (reading.status === 'ready' || reading.status === 'error') {
                  setReadingOpen(true)
                  return
                }
                void generateReading()
              }, [reading.status, generateReading])

              const saveReadingVocabulary = useCallback(async (item) => {
                if (reading.status !== 'ready') return
                await requestJson('/favorites', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    type: 'vocabulary',
                    text: item.word,
                    translation: item.meaning,
                    source: sourceSentenceFor(article.text, item.word),
                    topics: reading.data.topics,
                    pos: item.pos,
                    isWritingVocab: item.is_writing_vocab === true,
                  }),
                })
                if (typeof onFavoriteSaved === 'function') onFavoriteSaved()
              }, [reading, article.text, onFavoriteSaved])

              const saveReadingSentence = useCallback(async (item) => {
                if (reading.status !== 'ready') return
                await requestJson('/favorites', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    type: 'sentence',
                    text: item.sentence,
                    translation: '',
                    topics: reading.data.topics,
                    analysis: item.analysis,
                    embeddedPhrases: item.embedded_phrases,
                  }),
                })
                if (typeof onFavoriteSaved === 'function') onFavoriteSaved()
              }, [reading, onFavoriteSaved])

              const openQuiz = useCallback(() => {
                setQuizOpen(true)
                if (quiz.status === 'idle') void generateQuiz()
              }, [quiz.status, generateQuiz])

              const closeQuiz = useCallback(() => setQuizOpen(false), [])

              const answerQuiz = useCallback((index, label) => {
                if (submitted) return
                setAnswers((current) => ({ ...current, [index]: label }))
              }, [submitted])

              const submitQuiz = useCallback(() => {
                if (quiz.status !== 'ready') return
                const allAnswered = quiz.questions.every((_, index) => answers[index] !== undefined)
                if (!allAnswered) return
                setSubmitted(true)
              }, [quiz, answers])

              const resetQuizAnswers = useCallback(() => {
                setAnswers({})
                setSubmitted(false)
              }, [])

              const regenerateQuiz = useCallback(() => {
                if (
                  quiz.status === 'ready'
                  && (Object.keys(answers).length > 0 || submitted)
                  && !window.confirm(t('quizRegenerateConfirm'))
                ) {
                  return
                }
                void generateQuiz()
              }, [quiz.status, answers, submitted, generateQuiz, t])

              const commitCurrent = useCallback((byEnter) => {
                if (done) return
                if (lastCommittedRef.current === index) return
                if (typed.trim().length === 0) {
                  setHint(t('emptyHint'))
                  return
                }

                const exactNow = typed.trimEnd() === sentence
                if (!exactNow && !byEnter) {
                  setHint(t('notExactHint'))
                  return
                }

                lastCommittedRef.current = index
                const record = {
                  index,
                  en: sentence,
                  zh: '',
                  status: 'pending',
                  error: null,
                  provider: null,
                  model: null,
                  hadErrors: !exactNow,
                }

                setRecords((current) => (
                  current.some((item) => item.index === index) ? current : [...current, record]
                ))
                setIndex((current) => current + 1)
                setTyped('')
                setHint('')
                runTranslation(record)
              }, [done, index, typed, sentence, runTranslation, t])

              useEffect(() => {
                if (!done && typed.trimEnd() === sentence) commitCurrent(false)
              }, [typed, done, sentence, commitCurrent])

              function handleChange(event) {
                setTyped(event.target.value.replace(/\r?\n/g, ' '))
                if (hint.length > 0) setHint('')
              }

              function handleKeyDown(event) {
                if (event.key !== 'Enter') return
                if (event.nativeEvent?.isComposing) return
                event.preventDefault()
                commitCurrent(true)
              }

              function applyImportedArticle(nextArticle) {
                if (typeof nextArticle?.text !== 'string' || nextArticle.text.trim().length === 0) return
                for (const controller of controllersRef.current.values()) controller.abort()
                controllersRef.current.clear()
                if (quizAbortRef.current !== null) quizAbortRef.current.abort()
                if (readingAbortRef.current !== null) readingAbortRef.current.abort()
                setReadingOpen(false)
                setReading({ status: 'idle', data: null, error: null })
                dismissWordLookup(false)
                lastCommittedRef.current = -1
                setArticle({
                  title: typeof nextArticle.title === 'string' && nextArticle.title.trim().length > 0
                    ? nextArticle.title.trim()
                    : t('importPastedTitle'),
                  text: nextArticle.text,
                })
                setIndex(0)
                setTyped('')
                setRecords([])
                setHint('')
                setSavedKeys({})
                setSavingKeys({})
                setToast(null)
                setFloatMenu(null)
                setQuizOpen(false)
                setQuiz({
                  status: 'idle',
                  questions: [],
                  error: null,
                  provider: null,
                  model: null,
                  attempts: 0,
                })
                setAnswers({})
                setSubmitted(false)
                setImportOpen(false)
                window.setTimeout(() => inputRef.current?.focus(), 0)
              }

              function reset() {
                if ((records.length > 0 || typed.length > 0) && !window.confirm(t('resetConfirm'))) return
                for (const controller of controllersRef.current.values()) controller.abort()
                controllersRef.current.clear()
                dismissWordLookup(false)
                lastCommittedRef.current = -1
                setRecords([])
                setIndex(0)
                setTyped('')
                setHint('')
                window.setTimeout(() => inputRef.current?.focus(), 0)
              }

              const diffLabel = exact
                ? t('exact')
                : `${errors} ${t('errorUnit')}${extra > 0 ? ` · ${extra} ${t('extraChars')}` : ''}`

              return h(
                'div',
                {
                  className: embedded ? 'tp-root tp-embeddedRoot' : 'tp-root',
                  ref: rootRef,
                  onMouseUp: handleRootMouseUp,
                },
                floatMenu === null
                  ? null
                  : h(SelectionChip, {
                      menu: floatMenu,
                      t,
                      onOpen: () => setFloatMenu((current) => (current === null ? null : { ...current, mode: 'pick' })),
                      onPick: pickFavoriteType,
                      onClose: () => setFloatMenu(null),
                    }),
                toast === null
                  ? null
                  : h(
                      'div',
                      {
                        className: toast.tone === 'error' ? 'tp-favToast tp-favToastError' : 'tp-favToast',
                        role: 'status',
                      },
                      toast.text,
                    ),
                h(
                  'header',
                  { className: embedded ? 'tp-header tp-headerEmbedded' : 'tp-header' },
                  embedded
                    ? null
                    : h(
                        'div',
                        { className: 'tp-heading' },
                        h('h1', { className: 'tp-title' }, t('panelTitle')),
                        h('p', { className: 'tp-subtitle' }, t('panelSubtitle')),
                      ),
                  h(
                    'div',
                    { className: 'tp-headerActions' },
                    h(EngineBadge, { engine, t }),
                    h(
                      'button',
                      { className: 'tp-btn', type: 'button', onClick: () => setImportOpen(true) },
                      t('importArticle'),
                    ),
                    h(
                      'button',
                      { className: 'tp-btn', type: 'button', onClick: reset },
                      t('restart'),
                    ),
                  ),
                ),
                engine.state === 'error'
                  ? h(
                      'div',
                      { className: 'tp-alert' },
                      h(
                        'div',
                        { className: 'tp-alertText' },
                        h('div', null, engine.message || t('engineError')),
                        h('div', { className: 'tp-alertHint' }, t('noFallbackHint')),
                      ),
                    )
                  : null,
                h(
                  'div',
                  { className: 'tp-grid' },
                  h(
                    'div',
                    { className: 'tp-left' },
                    h(
                      'section',
                      { className: 'tp-card tp-reader' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('articleLabel')),
                        h(
                          'div',
                          { className: 'tp-cardHeadRight' },
                          h('span', { className: 'tp-cardMeta' }, `${Math.min(index + 1, total)} / ${total}`),
                          h(
                            'button',
                            {
                              className: 'tp-btn tp-btnSmall tp-readingBtn',
                              type: 'button',
                              disabled: reading.status === 'loading',
                              onClick: openReading,
                            },
                            reading.status === 'loading' ? t('readingGeneratingShort') : t('readingButton'),
                          ),
                          h(
                            'button',
                            {
                              className: 'tp-btn tp-btnSmall tp-quizBtn',
                              type: 'button',
                              onClick: openQuiz,
                              disabled: quiz.status === 'loading',
                              title: t('quizGenerateHint'),
                              'aria-haspopup': 'dialog',
                            },
                            quiz.status === 'loading'
                              ? t('quizGenerating')
                              : quiz.status === 'ready'
                                ? t('quizOpen')
                                : t('quizGenerate'),
                          ),
                        ),
                      ),
                      h(
                        'div',
                        { className: 'tp-article' },
                        h('h3', { className: 'tp-articleTitle' }, article.title),
                        sentenceGroups.map((group, groupIndex) => h(
                          'p',
                          {
                            key: groupIndex,
                            className: 'tp-sentences tp-paragraph',
                          },
                          group.items.map((item, localIndex) => {
                            const itemIndex = group.start + localIndex
                            return h(
                              'span',
                              {
                                key: itemIndex,
                                className: [
                                  'tp-sentence',
                                  itemIndex === index ? 'tp-sentenceActive' : '',
                                  itemIndex < index ? 'tp-sentenceDone' : '',
                                ].filter(Boolean).join(' '),
                              },
                              h(SentenceText, {
                                text: item,
                                typed: itemIndex === index ? typed : '',
                                active: itemIndex === index,
                                sentence: item,
                                onWordClick: handleWordClick,
                              }),
                              localIndex < group.items.length - 1 ? ' ' : '',
                            )
                          }),
                        )),
                      ),
                      h(
                        'div',
                        { className: 'tp-inputCard' },
                        done
                          ? h(
                              'div',
                              { className: 'tp-doneBox' },
                              h('div', { className: 'tp-doneTitle' }, t('doneTitle')),
                              h('p', { className: 'tp-doneBody' }, t('doneBody')),
                              h(
                                'button',
                                { className: 'tp-btn', type: 'button', onClick: reset },
                                t('restart'),
                              ),
                            )
                          : h(
                              React.Fragment,
                              null,
                              h(
                                'div',
                                { className: 'tp-inputTop' },
                                h('strong', null, `${t('inputLabel')} · ${t('sentenceLabel')} ${index + 1}`),
                                h(
                                  'span',
                                  { className: exact ? 'tp-diff tp-diffOk' : 'tp-diff' },
                                  diffLabel,
                                ),
                              ),
                              h('textarea', {
                                ref: inputRef,
                                className: 'tp-textarea',
                                value: typed,
                                onChange: handleChange,
                                onKeyDown: handleKeyDown,
                                placeholder: t('typingHint'),
                                spellCheck: false,
                                autoCapitalize: 'off',
                                autoCorrect: 'off',
                                autoComplete: 'off',
                                'aria-label': `${t('inputLabel')} ${index + 1}`,
                              }),
                              h(
                                'div',
                                {
                                  className: hint.length > 0
                                    ? 'tp-inputHint tp-inputHintWarn'
                                    : 'tp-inputHint',
                                },
                                hint.length > 0
                                  ? hint
                                  : exact
                                    ? t('exactHint')
                                    : t('typingHint'),
                              ),
                              h(
                                'div',
                                { className: 'tp-progress', 'aria-label': t('progressLabel') },
                                h('div', { className: 'tp-progressBar', style: { width: `${progress}%` } }),
                              ),
                            ),
                      ),
                    ),
                  ),
                  h(
                    'aside',
                    { className: 'tp-side' },
                    h(
                      'section',
                      { className: 'tp-card tp-current' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('currentTitle')),
                        latestRecord !== null
                          ? h(
                              'span',
                              { className: 'tp-cardMeta' },
                              `${latestRecord.index + 1} / ${total}`,
                            )
                          : null,
                      ),
                      h(
                        'div',
                        { className: 'tp-currentBody' },
                        h(TranslationCard, {
                          record: latestRecord,
                          t,
                          onRetry: runTranslation,
                          onCollect: collectSentence,
                          saved: latestRecord !== null && savedKeys[`s${latestRecord.index}`] === true,
                          busy: latestRecord !== null && savingKeys[`s${latestRecord.index}`] === true,
                        }),
                      ),
                    ),
                    h(
                      'section',
                      { className: 'tp-card tp-records' },
                      h(
                        'div',
                        { className: 'tp-cardHead' },
                        h('h2', { className: 'tp-cardTitle' }, t('recordsTitle')),
                        h('span', { className: 'tp-cardMeta' }, `${records.length} / ${total}`),
                      ),
                      h(
                        'div',
                        { className: 'tp-recordList', ref: listRef },
                        records.length === 0
                          ? h('div', { className: 'tp-empty' }, t('recordsEmpty'))
                          : records.map((record) => h(RecordRow, {
                              key: record.index,
                              record,
                              t,
                              onRetry: runTranslation,
                              onCollect: collectSentence,
                              saved: savedKeys[`s${record.index}`] === true,
                              busy: savingKeys[`s${record.index}`] === true,
                            })),
                      ),
                    ),
                  ),
                ),
                quizOpen
                  ? h(QuizDrawer, {
                      quiz,
                      answers,
                      submitted,
                      t,
                      onClose: closeQuiz,
                      onAnswer: answerQuiz,
                      onSubmit: submitQuiz,
                      onReset: resetQuizAnswers,
                      onGenerate: regenerateQuiz,
                    })
                  : null,
                importOpen
                  ? h(ImportArticleModal, {
                      t,
                      onClose: () => setImportOpen(false),
                      onImport: applyImportedArticle,
                    })
                  : null,
                readingOpen
                  ? h(ReadingAnalysisModal, {
                      t,
                      state: reading,
                      onClose: () => setReadingOpen(false),
                      onRetry: generateReading,
                      onSaveVocabulary: saveReadingVocabulary,
                      onSaveSentence: saveReadingSentence,
                    })
                  : null,
                wordPopover
                  ? h(WordModal, {
                      data: wordPopover,
                      t,
                      onClose: () => dismissWordLookup(true),
                      onSave: saveWord,
                      onRetry: retryWordLookup,
                    })
                  : null,
              )
            }

        module.exports = { TypingWorkspace: PracticeView }

      },
      "typing/quiz.js": function (module, exports, require) {
        const { React, h, useEffect } = require('../shared.js')

            const QUIZ_TYPE_KEYS = {
              detail: 'quizTypeDetail',
              inference: 'quizTypeInference',
              main_idea: 'quizTypeMainIdea',
              attitude: 'quizTypeAttitude',
              vocabulary: 'quizTypeVocabulary',
            }
            function assertQuizPayload(value) {
              if (!Array.isArray(value) || value.length !== 5) {
                throw new Error('题目数量必须是 5。')
              }

              return value.map((question, index) => {
                if (question === null || typeof question !== 'object' || Array.isArray(question)) {
                  throw new Error(`第 ${index + 1} 题不是对象。`)
                }
                if (typeof QUIZ_TYPE_KEYS[question.type] !== 'string') {
                  throw new Error(`第 ${index + 1} 题题型无效。`)
                }
                if (typeof question.stem !== 'string' || question.stem.trim().length === 0) {
                  throw new Error(`第 ${index + 1} 题缺少题干。`)
                }
                if (!Array.isArray(question.options) || question.options.length !== 4) {
                  throw new Error(`第 ${index + 1} 题必须有 4 个选项。`)
                }

                const labels = question.options.map((option) => option?.label)
                if (labels.join('') !== 'ABCD') {
                  throw new Error(`第 ${index + 1} 题的选项标签必须按 A/B/C/D 排列。`)
                }
                for (const option of question.options) {
                  if (typeof option?.text !== 'string' || option.text.trim().length === 0) {
                    throw new Error(`第 ${index + 1} 题有空白选项。`)
                  }
                }
                if (!labels.includes(question.answer)) {
                  throw new Error(`第 ${index + 1} 题的正确答案不在选项中。`)
                }
                if (typeof question.explanation !== 'string' || question.explanation.trim().length === 0) {
                  throw new Error(`第 ${index + 1} 题缺少解析。`)
                }
                if (typeof question.evidence !== 'string' || question.evidence.trim().length === 0) {
                  throw new Error(`第 ${index + 1} 题缺少原文依据。`)
                }

                return {
                  type: question.type,
                  stem: question.stem.trim(),
                  options: question.options.map((option) => ({
                    label: option.label,
                    text: option.text.trim(),
                  })),
                  answer: question.answer,
                  explanation: question.explanation.trim(),
                  evidence: question.evidence.trim(),
                }
              })
            }
            function quizTypeLabel(t, type) {
              const key = QUIZ_TYPE_KEYS[type]
              return key === undefined ? type : t(key)
            }
            function QuizQuestionCard(props) {
              const { question, index, selected, submitted, t, onAnswer } = props
              const correct = submitted && selected === question.answer

              return h(
                'article',
                { className: 'tp-quizQuestion' },
                h(
                  'div',
                  { className: 'tp-quizQHead' },
                  h('span', { className: 'tp-quizIndex' }, `${t('quizQuestionLabel')} ${index + 1}`),
                  h('span', { className: 'tp-quizType' }, quizTypeLabel(t, question.type)),
                  submitted
                    ? h(
                        'span',
                        { className: correct ? 'tp-quizResultOk' : 'tp-quizResultBad' },
                        correct ? t('quizCorrect') : t('quizWrong'),
                      )
                    : null,
                ),
                h('p', { className: 'tp-quizStem' }, question.stem),
                h(
                  'div',
                  { className: 'tp-quizOptions' },
                  question.options.map((option) => {
                    const isSelected = selected === option.label
                    const isCorrect = submitted && option.label === question.answer
                    const isWrong = submitted && isSelected && option.label !== question.answer
                    const className = [
                      'tp-quizOption',
                      !submitted && isSelected ? 'tp-quizOptionSelected' : '',
                      isCorrect ? 'tp-quizOptionCorrect' : '',
                      isWrong ? 'tp-quizOptionWrong' : '',
                    ].filter(Boolean).join(' ')

                    return h(
                      'label',
                      { key: option.label, className },
                      h('input', {
                        type: 'radio',
                        name: `tp-quiz-${index}`,
                        value: option.label,
                        checked: isSelected,
                        disabled: submitted,
                        onChange: () => onAnswer(option.label),
                      }),
                      h('span', { className: 'tp-quizOptionLabel' }, option.label),
                      h('span', { className: 'tp-quizOptionText' }, option.text),
                    )
                  }),
                ),
                submitted
                  ? h(
                      'div',
                      { className: 'tp-quizAnswerBox' },
                      h(
                        'div',
                        { className: 'tp-quizAnswerRow' },
                        h('span', { className: 'tp-quizAnswerLabel' }, `${t('quizCorrectAnswer')}：`),
                        h('span', { className: 'tp-quizAnswerValue' }, question.answer),
                        h(
                          'span',
                          { className: 'tp-quizYourAnswer' },
                          `${t('quizYourAnswer')}：${selected || t('quizNoAnswer')}`,
                        ),
                      ),
                      h(
                        'p',
                        { className: 'tp-quizExplanation' },
                        h('strong', null, `${t('quizExplanation')}：`),
                        question.explanation,
                      ),
                      h(
                        'blockquote',
                        { className: 'tp-quizEvidence' },
                        h('strong', null, `${t('quizEvidence')}：`),
                        `“${question.evidence}”`,
                      ),
                    )
                  : null,
              )
            }
            function QuizDrawer(props) {
              const { quiz, answers, submitted, t, onClose, onAnswer, onSubmit, onReset, onGenerate } = props
              const total = quiz.questions.length
              const answered = quiz.questions.filter((_, index) => answers[index] !== undefined).length
              const allAnswered = total > 0 && answered === total
              const score = submitted
                ? quiz.questions.filter((question, index) => answers[index] === question.answer).length
                : 0
              const types = new Set(quiz.questions.map((question) => question.type)).size

              useEffect(() => {
                const onKeyDown = (event) => {
                  if (event.key === 'Escape') onClose()
                }
                window.addEventListener('keydown', onKeyDown)
                return () => window.removeEventListener('keydown', onKeyDown)
              }, [onClose])

              const headerSubtitle = quiz.status === 'ready' && quiz.provider
                ? `${t('quizProvider')}：${quiz.provider.name || 'DeepSeek'} · ${quiz.model}`
                : t('quizSubtitle')

              return h(
                'div',
                { className: 'tp-quizLayer', onMouseUp: (event) => event.stopPropagation() },
                h('div', { className: 'tp-quizBackdrop', onClick: onClose, 'aria-hidden': true }),
                h(
                  'section',
                  {
                    className: 'tp-quizDrawer',
                    role: 'dialog',
                    'aria-modal': 'true',
                    'aria-label': t('quizTitle'),
                    onClick: (event) => event.stopPropagation(),
                  },
                  h(
                    'header',
                    { className: 'tp-quizHeader' },
                    h(
                      'div',
                      { className: 'tp-quizHeaderText' },
                      h('h2', { className: 'tp-quizTitle' }, t('quizTitle')),
                      h('p', { className: 'tp-quizSubtitle' }, headerSubtitle),
                    ),
                    h(
                      'div',
                      { className: 'tp-quizHeaderActions' },
                      h(
                        'button',
                        {
                          className: 'tp-btn tp-btnSmall',
                          type: 'button',
                          disabled: quiz.status === 'loading',
                          onClick: onGenerate,
                        },
                        t('quizRegenerate'),
                      ),
                      h(
                        'button',
                        { className: 'tp-quizClose', type: 'button', autoFocus: true, onClick: onClose },
                        t('quizClose'),
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'tp-quizBody' },
                    quiz.status === 'loading'
                      ? h(
                          'div',
                          { className: 'tp-quizLoading' },
                          h('div', { className: 'tp-quizSpinner' }),
                          h('div', { className: 'tp-quizLoadingText' }, t('quizLoading')),
                          h('div', { className: 'tp-quizLoadingHint' }, t('quizLoadingHint')),
                        )
                      : quiz.status === 'error'
                        ? h(
                            'div',
                            { className: 'tp-quizErrorBox' },
                            h('div', { className: 'tp-quizErrorTitle' }, t('quizError')),
                            h('div', { className: 'tp-quizErrorText' }, quiz.error?.message || t('quizError')),
                            h('div', { className: 'tp-quizErrorHint' }, t('quizErrorHint')),
                            h(
                              'button',
                              { className: 'tp-btn', type: 'button', onClick: onGenerate },
                              t('quizRetry'),
                            ),
                          )
                        : quiz.status === 'ready'
                          ? h(
                              React.Fragment,
                              null,
                              h(
                                'div',
                                { className: 'tp-quizSummary' },
                                h(
                                  'span',
                                  null,
                                  submitted
                                    ? `${t('quizScore')}：`
                                    : `${answered} / ${total} ${t('quizAnswered')}`,
                                ),
                                h(
                                  'strong',
                                  null,
                                  submitted
                                    ? `${score} / ${total}`
                                    : `${types} ${t('quizTypeUnit')}`,
                                ),
                              ),
                              quiz.questions.map((question, index) => h(QuizQuestionCard, {
                                key: index,
                                question,
                                index,
                                selected: answers[index],
                                submitted,
                                t,
                                onAnswer: (label) => onAnswer(index, label),
                              })),
                            )
                          : h('div', { className: 'tp-empty' }, t('quizError')),
                  ),
                  quiz.status === 'ready'
                    ? h(
                        'footer',
                        { className: 'tp-quizFooter' },
                        h(
                          'div',
                          { className: 'tp-quizFooterMeta' },
                          submitted
                            ? t('quizAllAnswered')
                            : allAnswered
                              ? t('quizAllAnswered')
                              : h(
                                  'span',
                                  { className: 'tp-quizNeedAll' },
                                  `${total - answered} ${t('quizUnansweredUnit')}`,
                                ),
                        ),
                        submitted
                          ? h(
                              'button',
                              { className: 'tp-btn', type: 'button', onClick: onReset },
                              t('quizReset'),
                            )
                          : h(
                              'button',
                              {
                                className: 'tp-btn tp-quizSubmit',
                                type: 'button',
                                disabled: !allAnswered,
                                title: allAnswered ? undefined : t('quizNeedAll'),
                                onClick: onSubmit,
                              },
                              t('quizSubmit'),
                            ),
                      )
                    : null,
                ),
              )
            }

        module.exports = { QuizDrawer, assertQuizPayload }

      },
      "typing/word-lookup.js": function (module, exports, require) {
        const WORD_PATTERN = /[A-Za-z]+(?:['’\-][A-Za-z]+)*/g

        function tokenizeSentence(text) {
          const source = String(text)
          const tokens = []
          let lastUtf16 = 0
          let lastCodePoint = 0

          for (const match of source.matchAll(WORD_PATTERN)) {
            const prefix = source.slice(lastUtf16, match.index)
            if (prefix.length > 0) {
              tokens.push({
                type: 'text',
                value: prefix,
                start: lastCodePoint,
              })
              lastCodePoint += Array.from(prefix).length
            }

            tokens.push({
              type: 'word',
              value: match[0],
              start: lastCodePoint,
            })
            lastCodePoint += Array.from(match[0]).length
            lastUtf16 = match.index + match[0].length
          }

          const tail = source.slice(lastUtf16)
          if (tail.length > 0) {
            tokens.push({
              type: 'text',
              value: tail,
              start: lastCodePoint,
            })
          }

          return tokens
        }

        function wordCacheKey(word) {
          return String(word).toLowerCase()
        }

        function dictionarySlug(word) {
          return String(word ?? '')
            .trim()
            .replace(/^[^\p{L}\p{N}]+/u, '')
            .replace(/[^\p{L}\p{N}]+$/u, '')
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .join('-')
        }

        function dictionaryUrl(provider, word) {
          const slug = dictionarySlug(word)
          if (slug.length === 0) return null
          const base = provider === 'longman'
            ? 'https://www.ldoceonline.com/dictionary/'
            : provider === 'oxford'
              ? 'https://www.oxfordlearnersdictionaries.com/definition/english/'
              : null
          if (base === null) return null
          return `${base}${encodeURIComponent(slug)}`
        }

        module.exports = {
          tokenizeSentence,
          wordCacheKey,
          dictionarySlug,
          dictionaryUrl,
        }

      },
    }
    const cache = Object.create(null)

    function normalize(request, from) {
      const base = from.split('/').slice(0, -1)
      const parts = (base.join('/') + '/' + request).split('/')
      const out = []
      for (const part of parts) {
        if (part === '' || part === '.') continue
        if (part === '..') out.pop()
        else out.push(part)
      }
      let id = out.join('/')
      if (!id.endsWith('.js')) id += '.js'
      return id
    }

    function load(id) {
      if (cache[id] !== undefined) return cache[id].exports
      const factory = modules[id]
      if (factory === undefined) throw new Error('Unknown client module: ' + id)
      const module = { exports: {} }
      cache[id] = module
      factory(module, module.exports, (request) => {
        if (request === 'react') return React
        if (!request.startsWith('.')) throw new Error('Unknown external module: ' + request)
        return load(normalize(request, id))
      })
      return module.exports
    }

    return load('entry.js')
  },
})
