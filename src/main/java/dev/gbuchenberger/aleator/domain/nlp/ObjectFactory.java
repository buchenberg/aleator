//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2015.01.09 at 04:04:19 PM MST 
//


package dev.gbuchenberger.aleator.domain.nlp;

import java.math.BigInteger;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.bind.annotation.adapters.CollapsedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the dev.gbuchenberger.aleator.domain.nlp package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

    private final static QName _Head_QNAME = new QName("", "head");
    private final static QName _POS_QNAME = new QName("", "POS");
    private final static QName _Start_QNAME = new QName("", "start");
    private final static QName _Lemma_QNAME = new QName("", "lemma");
    private final static QName _CharacterOffsetBegin_QNAME = new QName("", "CharacterOffsetBegin");
    private final static QName _NER_QNAME = new QName("", "NER");
    private final static QName _End_QNAME = new QName("", "end");
    private final static QName _Parse_QNAME = new QName("", "parse");
    private final static QName _Word_QNAME = new QName("", "word");
    private final static QName _CharacterOffsetEnd_QNAME = new QName("", "CharacterOffsetEnd");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: dev.gbuchenberger.aleator.domain.nlp
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link Dependencies }
     * 
     */
    public Dependencies createDependencies() {
        return new Dependencies();
    }

    /**
     * Create an instance of {@link Sentence }
     * 
     */
    public Sentence createSentence() {
        return new Sentence();
    }

    /**
     * Create an instance of {@link Document }
     * 
     */
    public Document createDocument() {
        return new Document();
    }

    /**
     * Create an instance of {@link Root }
     * 
     */
    public Root createRoot() {
        return new Root();
    }

    /**
     * Create an instance of {@link Governor }
     * 
     */
    public Governor createGovernor() {
        return new Governor();
    }

    /**
     * Create an instance of {@link Dependent }
     * 
     */
    public Dependent createDependent() {
        return new Dependent();
    }

    /**
     * Create an instance of {@link Sentences }
     * 
     */
    public Sentences createSentences() {
        return new Sentences();
    }

    /**
     * Create an instance of {@link Token }
     * 
     */
    public Token createToken() {
        return new Token();
    }

    /**
     * Create an instance of {@link Dep }
     * 
     */
    public Dep createDep() {
        return new Dep();
    }

    /**
     * Create an instance of {@link Coreference }
     * 
     */
    public Coreference createCoreference() {
        return new Coreference();
    }

    /**
     * Create an instance of {@link Mention }
     * 
     */
    public Mention createMention() {
        return new Mention();
    }

    /**
     * Create an instance of {@link Tokens }
     * 
     */
    public Tokens createTokens() {
        return new Tokens();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link BigInteger }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "head")
    public JAXBElement<BigInteger> createHead(BigInteger value) {
        return new JAXBElement<BigInteger>(_Head_QNAME, BigInteger.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "POS")
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    public JAXBElement<String> createPOS(String value) {
        return new JAXBElement<String>(_POS_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link BigInteger }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "start")
    public JAXBElement<BigInteger> createStart(BigInteger value) {
        return new JAXBElement<BigInteger>(_Start_QNAME, BigInteger.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "lemma")
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    public JAXBElement<String> createLemma(String value) {
        return new JAXBElement<String>(_Lemma_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link BigInteger }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "CharacterOffsetBegin")
    public JAXBElement<BigInteger> createCharacterOffsetBegin(BigInteger value) {
        return new JAXBElement<BigInteger>(_CharacterOffsetBegin_QNAME, BigInteger.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "NER")
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    public JAXBElement<String> createNER(String value) {
        return new JAXBElement<String>(_NER_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link BigInteger }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "end")
    public JAXBElement<BigInteger> createEnd(BigInteger value) {
        return new JAXBElement<BigInteger>(_End_QNAME, BigInteger.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "parse")
    public JAXBElement<String> createParse(String value) {
        return new JAXBElement<String>(_Parse_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "word")
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    public JAXBElement<String> createWord(String value) {
        return new JAXBElement<String>(_Word_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link BigInteger }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "CharacterOffsetEnd")
    public JAXBElement<BigInteger> createCharacterOffsetEnd(BigInteger value) {
        return new JAXBElement<BigInteger>(_CharacterOffsetEnd_QNAME, BigInteger.class, null, value);
    }

}
