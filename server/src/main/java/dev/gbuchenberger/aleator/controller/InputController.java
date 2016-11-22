package dev.gbuchenberger.aleator.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.xml.bind.JAXB;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import dev.gbuchenberger.aleator.domain.nlp.Root;
import dev.gbuchenberger.aleator.domain.repository.RootRepository;
import dev.gbuchenberger.aleator.model.Parse;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;

@RestController
public class InputController {
	
	@Autowired
	private ApplicationContext appContext;
	
	@RequestMapping(value = "/api/input", method = RequestMethod.POST)
    public Parse postInput(@RequestBody final String input) {
		
		//TODO This object should be bootstrapped and injected from Application?
		RootRepository repository = appContext.getBean(RootRepository.class);
		
		//TODO These could come in the payload or as params.
		Properties props = new Properties();
		props.put("annotators", "tokenize, ssplit, pos, parse");
		props.put("outputFormat", "xml");
		
		//instantiate pipeline
		StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
		
		//process input with pipeline
		Annotation document = new Annotation(input);
		pipeline.annotate(document);
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		
		List<String> sentences = new ArrayList<String>();
		
		try {
			pipeline.xmlPrint(document, baos);
			String xmlString = baos.toString("UTF-8");
			baos.close();
			Root root = JAXB.unmarshal(new StringReader(xmlString), Root.class);
			repository.save(root);	        
	        for (int i = 0; i < root.getDocument().getSentences().getSentence().toArray().length; i++) {
	        	for (int j = 0; j < root.getDocument().getSentences().getSentence().get(i).getContentItems().toArray().length; j++) {
	        		if (root.getDocument().getSentences().getSentence().get(i).getContentItems().get(j).getItemParse() != null){
	        			sentences.add(root.getDocument().getSentences().getSentence().get(i).getContentItems().get(j).getItemParse());
	        		};
	        	};
	        };
	        Parse parse = new Parse(1, sentences);
	        return parse;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
    }

}
