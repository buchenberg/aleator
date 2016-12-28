package dev.gbuchenberger.aleator.controller;

import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import dev.gbuchenberger.aleator.domain.nlp.Token;
import dev.gbuchenberger.aleator.domain.nlp.Tokens;
import dev.gbuchenberger.aleator.domain.repository.TokenRepository;
import dev.gbuchenberger.aleator.domain.repository.TokensRepository;
import dev.gbuchenberger.aleator.model.Random;

@RestController
public class RandomController {
	protected final Logger log = LoggerFactory.getLogger(getClass());

	@Autowired
	private TokensRepository tokensRepo;
	@Autowired
	private TokenRepository tokenRepo;

	@CrossOrigin(origins = "*")
	@RequestMapping("api/random")
	public Random getRandom() {
		log.info("Get random");
		String random = new String();
		// List<String> wordList = new ArrayList<String>();
		Tokens randomTokens = tokensRepo.getRandomTokens();
		Iterator<Token> tokenIterator = randomTokens.getToken().iterator();
		if (tokenIterator.hasNext()) {
			// first
			String input = tokenRepo.findRandomWordByPos(tokenIterator.next()
					.getPos());
			String output = input.substring(0, 1).toUpperCase() + input.substring(1);
			random += output;
			while (tokenIterator.hasNext()) {
				// process the rest
				String pos = tokenIterator.next()
						.getPos();
				if (!pos.matches("\\.|,|POS")) {
					random += " ";
				} 
				String nextWord = tokenRepo.findRandomWordByPos(pos);
				if (pos.equals("NNP")) {
					random += nextWord;
				} else {
					random += nextWord.toLowerCase();

				}
					
				
				
			}
		}
		Random randObj = new Random(1, random);
		return randObj;
	}

}
